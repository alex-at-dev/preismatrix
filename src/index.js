(() => {
  const id = {
    tbody: "pm--tbody",
    tplGroup: "pm--tpl-group",
    tplFeature: "pm--tpl-feature",
    tplCheckIcon: "pm--tpl-check-icon",
    tplInfoIcon: "pm--tpl-info-icon",
    btnToggleDetails: "pm--toggle-details",
  };

  const cls = {
    group: "pm--group",
    groupTitle: "pm--group__title",
    feature: "pm--feature",
    featureHidden: "pm--feature_hidden",
    featureDetail: "pm--feature_detail",
    featureInfo: "pm--feature__info",
    featureTitle: "pm--feature__title",
    featureDescription: "pm--feature__description",
    hasFeature: "pm--has-feature",
    highlighted: "pm--highlighted",
    borderRight: "border-right",
    intersectionPixel: "pm--intersection-pixel",
    intersectionPixelLeft: "pm--intersection-pixel_left",
    intersectionPixelRight: "pm--intersection-pixel_right",
    scrollShadow: "pm--scroll-shadow",
    scrollShadowLeftVisible: "pm--scroll-shadow-left_visible",
    scrollShadowRightVisible: "pm--scroll-shadow-right_visible",
  };

  const sel = (cls) => "." + cls;

  function insertFeatureData() {
    const $tbody = document.getElementById(id.tbody);
    const $groupTpl = document.getElementById(id.tplGroup);
    const $featureTpl = document.getElementById(id.tplFeature);
    const $tplCheckIcon = document.getElementById(id.tplCheckIcon);
    const $tplInfoIcon = document.getElementById(id.tplInfoIcon);

    window.PM__FEATURE_DATA.forEach((group) => {
      const $tpl = $groupTpl?.cloneNode(true).content;
      const $title = $tpl?.querySelector(sel(cls.groupTitle));

      if (!$tpl || !$title) return;

      $title.textContent = group.name;
      $tbody.appendChild($tpl);

      group.items.forEach((feature) => {
        /** @type {Element} */
        const $tpl = $featureTpl?.cloneNode(true).content;
        const $title = $tpl?.querySelector(sel(cls.featureTitle));
        const $description = $tpl?.querySelector(sel(cls.featureDescription));
        const $hasFeatureDivs = $tpl?.querySelectorAll(sel(cls.hasFeature));

        if (!$tpl || !$title || !$description || !$hasFeatureDivs.length)
          return;

        $title.textContent = decodeURIComponent(feature.name);
        if (feature.description) {
          $description.textContent = decodeURIComponent(feature.description);
          $title.appendChild($tplInfoIcon.content.cloneNode(true));
        } else $description.remove();
        $hasFeatureDivs.forEach(($div, i) => {
          let html;
          const val = feature.tiers[i];
          if (val === 1) html = $tplCheckIcon.innerHTML;
          else if (val === 0) html = "-";
          else html = val;
          $div.innerHTML = html;
        });

        $tbody.appendChild($tpl);
      });
    });
  }

  function setupIntersectionObserver() {
    const handleIntersect = (entries) => {
      entries.forEach((e) => {
        let fn;

        if (e.isIntersecting) fn = "remove";
        else fn = "add";

        const $shadows = document.querySelectorAll(sel(cls.scrollShadow));
        $shadows.forEach(($s) => {
          let shadowCls;
          if (e.target.classList.contains(cls.intersectionPixelLeft)) {
            shadowCls = cls.scrollShadowLeftVisible;
          } else {
            shadowCls = cls.scrollShadowRightVisible;
          }
          $s.classList[fn](shadowCls);
        });
      });
    };

    const options = {
      root: null,
      threshold: [0, 1],
    };

    const observer = new IntersectionObserver(handleIntersect, options);

    const $pixels = document.querySelectorAll(sel(cls.intersectionPixel));
    $pixels.forEach(($p) => observer.observe($p));
  }

  document.addEventListener("DOMContentLoaded", () => {
    insertFeatureData();
    setupIntersectionObserver();
  });
})();
