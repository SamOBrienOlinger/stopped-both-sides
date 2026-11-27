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
        let shot = XCTAttachment(screenshot: app.screenshot())
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
        if control["control"] as? String == "menu" {
            tap(control)
            guard let search = awaitState(name+"-search-control", stable: true, { $0["control"] as? String == "search" }) else { return }
            tap(search)
        } else { tap(control) }
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
        attach(focused,name:name+"-focused")
        XCTAssertEqual(focused["visible"] as? Bool, true, "Focused field outside dialog or visible viewport")
        XCTAssertEqual(focused["hittable"] as? Bool, true, "Focused field center is obstructed")
        app.typeText("Garda")
        guard let typed = awaitState(name+"-results", stable:true, { state in
            hasKeyboard(state) && (state["value"] as? String)?.lowercased() == "garda" &&
                (state["count"] as? Int ?? 0) > 0
        }) else { return }
        attach(typed,name:name+"-typed")
        XCTAssertTrue(nativeKeyboard.exists)
        XCTAssertEqual(typed["visible"] as? Bool,true,"Search results displaced the field")
        XCTAssertEqual(typed["hittable"] as? Bool,true,"Search results obstructed the field")
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
