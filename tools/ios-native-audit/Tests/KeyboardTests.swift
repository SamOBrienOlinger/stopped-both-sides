import XCTest
import UIKit

final class KeyboardTests: XCTestCase {
    private typealias State = [String: Any]
    private let app = XCUIApplication()

    private func readState() -> State {
        let status = app.staticTexts["audit-state"]
        guard status.exists, let text = status.value as? String,
              let object = try? JSONSerialization.jsonObject(with: Data(text.utf8)) else { return [:] }
        return object as? State ?? [:]
    }

    private func awaitState(_ stage: String, timeout: TimeInterval = 18,
                            stable: Bool = false, _ predicate: (State) -> Bool) -> State? {
        let deadline = Date().addingTimeInterval(timeout)
        var state = State()
        var since = Date()
        var previous = ""
        repeat {
            state = readState()
            let signature = ["control","screenX","screenY","top","vh","keyboardHeight","fieldTop","fieldBottom","value","count"].map { String(describing: state[$0]) }.joined(separator: "|")
            if !predicate(state) || previous != signature { since = Date() }
            previous = signature
            if predicate(state) && (!stable || Date().timeIntervalSince(since) > 0.8) { return state }
            Thread.sleep(forTimeInterval: 0.2)
        } while Date() < deadline
        attach(state, name: "failed-"+stage)
        XCTFail("Could not verify \(stage). Last observation: \(state)")
        return nil
    }

    private func attach(_ state: State, name: String) {
        if let json = try? JSONSerialization.data(withJSONObject: state, options: [.sortedKeys]),
           let text = String(data: json, encoding: .utf8) {
            print("IOS_KEYBOARD_RESULT \(name) \(text)")
            let attachment = XCTAttachment(string: text)
            attachment.name = name
            attachment.lifetime = .keepAlways
            add(attachment)
        }
        let shot = XCTAttachment(screenshot: XCUIScreen.main.screenshot())
        shot.name = name + "-screen"
        shot.lifetime = .keepAlways
        add(shot)
    }

    private func tap(_ state: State) {
        guard let x = state["screenX"] as? Double, let y = state["screenY"] as? Double else {
            XCTFail("Missing control tap coordinates"); return
        }
        app.coordinate(withNormalizedOffset: CGVector.zero).withOffset(CGVector(dx:x, dy:y)).tap()
    }

    private func check(_ role: String, _ lang: String, _ orientation: String) {
        let nativeOrientation: UIDeviceOrientation = orientation == "landscape" ? .landscapeLeft : .portrait
        XCUIDevice.shared.orientation = nativeOrientation
        app.launchEnvironment = ["AUDIT_ROLE":role, "AUDIT_LOCALE":lang, "AUDIT_ORIENTATION":orientation]
        app.launch()
        XCUIDevice.shared.orientation = nativeOrientation
        let name = "\(role)-\(lang)-\(orientation)"
        let expectedLanguage = lang == "en" ? "en-IE" : lang
        guard let control = awaitState(name+"-header-control", timeout: 30, stable: true, { state in
            state["control"] is String && state["language"] as? String == expectedLanguage && state["font"] as? Double == 24
        }) else { return }
        var next = control
        if next["control"] as? String == "menu" {
            tap(next)
            guard let item = awaitState(name+"-expanded-menu", stable: true, { ["scroll","search"].contains($0["control"] as? String ?? "") }) else { return }
            next = item
        }
        for _ in 0..<4 where next["control"] as? String == "scroll" {
            guard let x=next["screenX"] as? Double, let y=next["screenY"] as? Double, let end=next["screenEndY"] as? Double else { break }
            let origin=app.coordinate(withNormalizedOffset: .zero)
            origin.withOffset(CGVector(dx:x,dy:y)).press(forDuration:0.1,thenDragTo:origin.withOffset(CGVector(dx:x,dy:end)))
            guard let item = awaitState(name+"-scroll-menu", stable:true, { ["scroll","search"].contains($0["control"] as? String ?? "") }) else { return }
            next=item
        }
        guard next["control"] as? String == "search" else { attach(next,name:name+"-missing-search"); XCTFail("Search is unreachable by touch"); return }
        tap(next)
        let nativeKeyboard = app.keyboards.firstMatch
        guard let opened = awaitState(name+"-opened", stable: true, { $0["input"] as? Bool == true }) else { return }
        attach(opened, name:name+"-opened")
        if !nativeKeyboard.waitForExistence(timeout: 2) {
            guard let field = awaitState(name+"-field", stable: true, { $0["input"] as? Bool == true && $0["hittable"] as? Bool == true }) else { return }
            tap(field)
        }
        guard nativeKeyboard.waitForExistence(timeout: 8) else {
            attach(readState(),name:name+"-keyboard-missing")
            XCTFail("The iOS software keyboard did not appear"); return
        }
        let hasKeyboard: (State) -> Bool = { state in
            state["focused"] as? Bool == true && (state["keyboardHeight"] as? Double ?? 0) > 50 &&
                (state["before"] as? Double ?? 0) - (state["vh"] as? Double ?? 0) > 50
        }
        guard let focused = awaitState(name+"-contracted",stable:true,hasKeyboard) else { return }
        func validateNativeFrame(_ measurement: State, _ stage: String) -> Bool {
            var observation=measurement
            let web=app.webViews.firstMatch
            let searchField=web.searchFields.firstMatch, textField=web.textFields.firstMatch
            let field=searchField.exists ? searchField : textField
            let keyboardTop=nativeKeyboard.frame.minY
            observation["xcuiKeyboardTop"]=keyboardTop
            let inside: Bool
            if field.exists && !field.frame.isEmpty {
                let frame=field.frame
                observation["xcuiFieldTop"]=frame.minY
                observation["xcuiFieldBottom"]=frame.maxY
                inside=frame.minY >= web.frame.minY-1 && frame.maxY <= keyboardTop+1
            } else {
                // A subsequent trusted pointer event on the actual search field checks this projection.
                guard let lo=measurement["fieldNativeTop"] as? Double, let hi=measurement["fieldNativeBottom"] as? Double else { return false }
                observation["projection"]="WebView client rect projected into its native frame"
                inside=lo >= web.frame.minY-1 && hi <= keyboardTop+1
            }
            attach(observation,name:name+"-"+stage)
            XCTAssertTrue(inside,"Field crosses the native keyboard or WebView bounds")
            XCTAssertEqual(measurement["visible"] as? Bool,true,"Field outside its scrolling dialog")
            XCTAssertEqual(measurement["hittable"] as? Bool,true,"Field center obstructed")
            return inside && measurement["visible"] as? Bool == true && measurement["hittable"] as? Bool == true
        }
        guard validateNativeFrame(focused,"focused") else { return }
        let originalTaps=focused["fieldTaps"] as? Int ?? 0
        tap(focused)
        guard awaitState(name+"-trusted-field-tap", { ($0["fieldTaps"] as? Int ?? 0)>originalTaps && hasKeyboard($0) }) != nil else { return }
        app.typeText("Garda")
        guard let typed = awaitState(name+"-results", stable:true, { state in
            hasKeyboard(state) && (state["value"] as? String)?.lowercased() == "garda" &&
                (state["count"] as? Int ?? 0) > 0
        }) else { return }
        _ = validateNativeFrame(typed,"typed")
        XCTAssertTrue(nativeKeyboard.exists)
        XCTAssertEqual((typed["nativeWidth"] as? Double ?? 0) > (typed["nativeHeight"] as? Double ?? 0),
                       orientation == "landscape")
    }

    func testEnglishPublicLandscape() { check("public","en","landscape") }
    func testEnglishGardaLandscape() { check("garda","en","landscape") }
    func testArabicPublicLandscape() { check("public","ar","landscape") }
    func testArabicGardaLandscape() { check("garda","ar","landscape") }
    func testEnglishPublicPortrait() { check("public","en","portrait") }
    func testEnglishGardaPortrait() { check("garda","en","portrait") }
    func testArabicPublicPortrait() { check("public","ar","portrait") }
    func testArabicGardaPortrait() { check("garda","ar","portrait") }
}
