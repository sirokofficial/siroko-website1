/* Cookie banner: Google Analytics stays off until the visitor accepts (see the consent default in each page head). */
(function () {
  var KEY = "sirokoConsent";
  function get() { try { return localStorage.getItem(KEY); } catch (e) { return null; } }
  function set(v) { try { localStorage.setItem(KEY, v); } catch (e) {} }
  function update(v) {
    if (typeof window.gtag === "function") {
      window.gtag("consent", "update", { analytics_storage: v === "granted" ? "granted" : "denied" });
    }
  }
  window.sirokoResetConsent = function () {
    try { localStorage.removeItem(KEY); } catch (e) {}
    location.reload();
  };
  if (get()) return;
  var bar = document.createElement("div");
  bar.className = "cookie-banner";
  bar.setAttribute("role", "dialog");
  bar.setAttribute("aria-label", "Cookie preferences");
  bar.innerHTML =
    "<p>We use Google Analytics cookies to see which pages people visit. Nothing is tracked unless you accept. " +
    '<a href="privacy.html">Privacy &amp; cookies</a></p>' +
    '<div class="cookie-actions"><button class="cookie-btn" data-choice="denied" type="button">Decline</button>' +
    '<button class="cookie-btn cookie-btn-primary" data-choice="granted" type="button">Accept</button></div>';
  bar.addEventListener("click", function (e) {
    var b = e.target.closest("[data-choice]");
    if (!b) return;
    var v = b.getAttribute("data-choice");
    set(v);
    update(v);
    bar.remove();
  });
  document.body.appendChild(bar);
})();
