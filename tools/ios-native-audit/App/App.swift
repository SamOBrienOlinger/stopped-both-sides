import UIKit
import WebKit

@main
class AppDelegate: UIResponder, UIApplicationDelegate {
    var window: UIWindow?
    func application(_ application: UIApplication,
                     didFinishLaunchingWithOptions launchOptions: [UIApplication.LaunchOptionsKey: Any]?) -> Bool {
        let window = UIWindow(frame: UIScreen.main.bounds)
        window.rootViewController = AuditController()
        window.makeKeyAndVisible()
        self.window = window
        return true
    }
}

class AuditController: UIViewController {
    private let status = UILabel()
    private var web: WKWebView!
    private var timer: Timer?
    private var querying = false
    private var keyboardRect = CGRect.zero

    private let sample = #"""
    (() => {
      const root=document.documentElement, vv=window.visualViewport;
      const width=vv.width, height=vv.height, left=vv.offsetLeft, top=vv.offsetTop;
      const ready=document.querySelector('.header.navigation-ready') &&
        document.querySelector('#main h1') && !document.querySelector('#main .initial');
      const state={ready:!!ready, font:parseFloat(getComputedStyle(root).fontSize), language:root.lang,
        vw:width,vh:height,top,left,scale:vv.scale, direction:root.dir,
        path:location.pathname, input:false, count:0, page:document.querySelector('main h1')?.textContent || ''};
      if (!ready || state.font < 23) return state;
      if (!window.__auditRecording) {
        window.__auditRecording=true;
        window.__auditFieldTaps=0;
        document.addEventListener('pointerdown',event=>{
          if (event.isTrusted && event.target.id==='site-search-input') window.__auditFieldTaps++;
        },true);
      }
      const field=document.querySelector('#site-search-input');
      const dialog=field?.closest('dialog');
      if (!dialog?.open) {
        if (!matchMedia('(orientation:'+window.__auditOrientation+')').matches) return state;
        window.__auditBefore=height;
        const trigger=document.querySelector('#site-search-trigger'), menu=document.querySelector('[data-nav-toggle]');
        const target=menu?.offsetWidth && menu.getAttribute('aria-expanded')==='false' ? menu : trigger;
        if (!target) return state;
        const box=target.getBoundingClientRect(), x=box.left+box.width/2,y=box.top+box.height/2;
        const hit=document.elementFromPoint(x,y);
        if (!box.height || !box.width) return state;
        if (!target.contains(hit)) {
          for (let node=target.parentElement;node;node=node.parentElement) {
            if (!/auto|scroll/.test(getComputedStyle(node).overflowY) || node.scrollHeight<=node.clientHeight) continue;
            const clip=node.getBoundingClientRect(), lo=Math.max(0,clip.top), hi=Math.min(height,clip.bottom);
            if (hi-lo<40) continue;
            const up=y>=(lo+hi)/2;
            Object.assign(state,{control:'scroll',x:Math.min(width-2,Math.max(2,(clip.left+clip.right)/2)),
              y:lo+(hi-lo)*(up?0.8:0.2),endY:lo+(hi-lo)*(up?0.2:0.8)});
            return state;
          }
          return state;
        }
        Object.assign(state,{control:target===menu?'menu':'search',x:(x-left)*vv.scale,y:(y-top)*vv.scale});
        return state;
      }
      state.before=window.__auditBefore;
      const f=field.getBoundingClientRect(), d=dialog.getBoundingClientRect();
      const x=f.x+f.width/2, y=f.y+f.height/2;
      state.x=x*vv.scale; state.y=y*vv.scale;
      const hit=document.elementFromPoint(x,y);
      Object.assign(state,{input:true, value:field.value, focused:field===document.activeElement,
        hittable:hit===field, fieldTaps:window.__auditFieldTaps, count:document.querySelectorAll('#site-search-results .site-search-result').length,
        fieldTop:f.top,fieldBottom:f.bottom,fieldLeft:f.left,fieldRight:f.right,
        dialogTop:d.top,dialogBottom:d.bottom,dialogLeft:d.left,dialogRight:d.right,
        dialogScroll:dialog.scrollTop,documentScroll:scrollY,rootTop:root.getBoundingClientRect().top,
        visible:f.left >= d.left-1 && f.right <= d.right+1 && f.top >= d.top-1 && f.bottom <= d.bottom+1});
      return state;
    })()
    """#

    override func viewDidLoad() {
        super.viewDidLoad()
        let environment = ProcessInfo.processInfo.environment
        let role = environment["AUDIT_ROLE"] == "garda" ? "garda" : "public"
        let locale = environment["AUDIT_LOCALE"] == "ar" ? "ar" : "en"
        let configuration = WKWebViewConfiguration()
        let orientation = environment["AUDIT_ORIENTATION"] == "landscape" ? "landscape" : "portrait"
        let prefs = """
        window.__auditOrientation="\(orientation)";
        try { localStorage.setItem('garda-encounter-reading-v1:\(role)',
          JSON.stringify({language:'\(locale)',size:150,spacing:true,motion:true})); } catch (_) {}
        """
        configuration.userContentController.addUserScript(WKUserScript(source: prefs,
            injectionTime: .atDocumentStart, forMainFrameOnly: true))
        web = WKWebView(frame: .zero, configuration: configuration)
        web.scrollView.contentInsetAdjustmentBehavior = .never
        web.translatesAutoresizingMaskIntoConstraints = false
        view.backgroundColor = .white
        view.addSubview(web)
        let guide = view.safeAreaLayoutGuide
        NSLayoutConstraint.activate([web.topAnchor.constraint(equalTo: guide.topAnchor),
            web.bottomAnchor.constraint(equalTo: guide.bottomAnchor), web.leadingAnchor.constraint(equalTo: guide.leadingAnchor),
            web.trailingAnchor.constraint(equalTo: guide.trailingAnchor)])
        status.translatesAutoresizingMaskIntoConstraints = false
        status.text = "•"
        status.accessibilityIdentifier = "audit-state"
        status.accessibilityValue = "{}"
        status.isAccessibilityElement = true
        status.isUserInteractionEnabled = false
        view.addSubview(status)
        NSLayoutConstraint.activate([status.leadingAnchor.constraint(equalTo: guide.leadingAnchor),
            status.topAnchor.constraint(equalTo: guide.topAnchor),status.widthAnchor.constraint(equalToConstant: 4),
            status.heightAnchor.constraint(equalToConstant: 8)])
        NotificationCenter.default.addObserver(self, selector: #selector(keyboardChanged(_:)),
            name: UIResponder.keyboardDidChangeFrameNotification, object: nil)
        NotificationCenter.default.addObserver(self, selector: #selector(keyboardHidden),
            name: UIResponder.keyboardDidHideNotification, object: nil)
        let path = role == "garda" ? "garda/" : ""
        web.load(URLRequest(url: URL(string:"http://127.0.0.1:4173/stopped-both-sides/\(path)?lang=\(locale)#play")!))
        timer = Timer.scheduledTimer(withTimeInterval: 0.25, repeats: true) { [weak self] _ in self?.refresh() }
    }
    @objc private func keyboardChanged(_ note: Notification) {
        keyboardRect = (note.userInfo?[UIResponder.keyboardFrameEndUserInfoKey] as? NSValue)?.cgRectValue ?? .zero
    }
    @objc private func keyboardHidden() { keyboardRect = .zero }
    private func refresh() {
        guard !querying, let window = view.window else { return }
        querying = true
        web.evaluateJavaScript(sample) { [weak self] result, error in
            guard let self = self else { return }
            self.querying = false
            var state = result as? [String: Any] ?? ["error":error?.localizedDescription ?? "no sample"]
            let webOrigin = self.web.convert(CGPoint.zero, to: window)
            if let x = state["x"] as? Double, let y = state["y"] as? Double {
                state["screenX"] = webOrigin.x + CGFloat(x)
                state["screenY"] = webOrigin.y + CGFloat(y)
                if let end = state["endY"] as? Double { state["screenEndY"] = webOrigin.y + CGFloat(end) }
                if let t=state["fieldTop"] as? Double, let b=state["fieldBottom"] as? Double,
                   let scale=state["scale"] as? Double {
                    state["fieldNativeTop"] = webOrigin.y + CGFloat(t * scale)
                    state["fieldNativeBottom"] = webOrigin.y + CGFloat(b * scale)
                }
            }
            let frame = window.convert(self.keyboardRect, from: window.screen.coordinateSpace)
            state["keyboardHeight"] = max(0, frame.intersection(window.bounds).height)
            state["keyboardTop"] = frame.minY
            state["webScreenY"] = webOrigin.y
            state["nativeWidth"] = window.bounds.width
            state["nativeHeight"] = window.bounds.height
            if let data = try? JSONSerialization.data(withJSONObject: state),
                let value = String(data: data, encoding: .utf8) {
                self.status.accessibilityValue = value
            }
        }
    }
}
