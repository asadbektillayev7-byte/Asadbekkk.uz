/* Microneedle write-up: show it only for the All and Research filters on the Works page. */
(function () {
  const section = document.getElementById("microneedles");
  if (!section) return;
  document.querySelectorAll("[data-project-filter]").forEach(btn => btn.addEventListener("click", () => {
    const f = btn.dataset.projectFilter;
    section.hidden = !(f === "all" || f === "research");
  }));
})();
