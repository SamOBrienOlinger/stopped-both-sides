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
                            _ predicate: (State) -> Bool) -> State? {
        let deadline = Date().addingTimeInterval(timeout)
        var state = State()
        repeat {
            state = readState()
            if predicate(state) { return state }
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

    private func check(_ role: String, _ lang: String, _ orientation: String) {
        let nativeOrientation: UIDeviceOrientation = orientation == "landscape" ? .landscapeLeft : .portrait
        XCUIDevice.shared.orientation = nativeOrientation
        app.launchEnvironment = ["AUDIT_ROLE":role, "AUDIT_LOCALE":lang, "AUDIT_ORIENTATION":orientation]
        app.launch()
        XCUIDevice.shared.orientation = nativeOrientation
        let name = "\(role)-\(lang)-\(orientation)"
        let expectedLanguage = lang == "en" ? "en-IE" : lang
        guard let opened = awaitState(name+"-opened", timeout: 30, { state in
            state["input"] as? Bool == true && state["language"] as? String == expectedLanguage &&
            state["font"] as? Double == 24 && (state["before"] as? Double ?? 0)>0
        }) else { return }
        attach(opened, name: name+"-before-native-tap")
        guard let x = opened["screenX"] as? Double, let y = opened["screenY"] as? Double else {
            XCTFail("Could not locate native tap target"); return
        }
        app.coordinate(withNormalizedOffset: CGVector.zero).withOffset(CGVector(dx:x, dy:y)).tap()
        let nativeKeyboard = app.keyboards.firstMatch
        guard nativeKeyboard.waitForExistence(timeout: 8) else {
            attach(readState(),name:name+"-keyboard-missing")
            XCTFail("The iOS software keyboard did not appear"); return
        }
        let hasKeyboard: (State) -> Bool = { state in
            state["focused"] as? Bool == true && (state["keyboardHeight"] as? Double ?? 0) > 50 &&
                (state["before"] as? Double ?? 0) - (state["vh"] as? Double ?? 0) > 50
        }
        guard let focused = awaitState(name+"-contracted",hasKeyboard) else { return }
        attach(focused,name:name+"-focused")
        XCTAssertEqual(focused["visible"] as? Bool, true, "Focused field outside dialog or visible viewport")
        XCTAssertEqual(focused["hittable"] as? Bool, true, "Focused field center is obstructed")
        app.typeText("Garda")
        guard let typed = awaitState(name+"-results", { state in
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
