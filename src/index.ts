import { Feature } from './types/Feature';
import { FeatureGroup } from './types/FeatureGroup';
import './index.css';

declare global {
  interface Window {
    PM__FEATURE_DATA: FeatureGroup[];
  }
}

const id = {
  tbody: 'pm--tbody',
  tplGroup: 'pm--tpl-group',
  tplFeature: 'pm--tpl-feature',
  tplCheckIcon: 'pm--tpl-check-icon',
  tplInfoIcon: 'pm--tpl-info-icon',
  btnToggleDetails: 'pm--toggle-details',
};

const cls = {
  group: 'pm--group',
  groupTitle: 'pm--group__title',
  feature: 'pm--feature',
  featureHidden: 'pm--feature_hidden',
  featureDetail: 'pm--feature_detail',
  featureInfo: 'pm--feature__info',
  featureTitle: 'pm--feature__title',
  featureDescription: 'pm--feature__description',
  hasFeature: 'pm--has-feature',
  highlighted: 'pm--highlighted',
  borderRight: 'border-right',
  intersectionPixel: 'pm--intersection-pixel',
  intersectionPixelLeft: 'pm--intersection-pixel_left',
  intersectionPixelRight: 'pm--intersection-pixel_right',
  scrollShadow: 'pm--scroll-shadow',
  scrollShadowLeftVisible: 'pm--scroll-shadow-left_visible',
  scrollShadowRightVisible: 'pm--scroll-shadow-right_visible',
};

const sel = (cls: string) => '.' + cls;

function getClonedTemplateContent($tpl: HTMLTemplateElement) {
  return $tpl.content.cloneNode(true) as DocumentFragment;
}

function setElText($el: Element, text: string) {
  $el.textContent = decodeURIComponent(text.trim());
}

function fillGroupTpl(group: FeatureGroup, $tpl: HTMLTemplateElement) {
  const $group = getClonedTemplateContent($tpl);
  const $title = $group.querySelector(sel(cls.groupTitle));
  if (!$title) return;

  setElText($title, group.name);
  return $group;
}

function fillFeatureTpl(
  feature: Feature,
  $tplFeature: HTMLTemplateElement,
  $tplCheckIcon: HTMLTemplateElement,
  $tplInfoIcon: HTMLTemplateElement
) {
  const $feature = getClonedTemplateContent($tplFeature);
  const $title = $feature.querySelector(sel(cls.featureTitle));
  const $description = $feature.querySelector(sel(cls.featureDescription));
  const $hasFeatureDivs = $feature.querySelectorAll(sel(cls.hasFeature));
  if (!$title || !$description || !$hasFeatureDivs.length) return;

  // title
  setElText($title, feature.name);

  // description
  if (feature.description) {
    setElText($description, feature.description);
    $title.appendChild($tplInfoIcon.content.cloneNode(true));
  } else $description.remove();

  // hasFeatures
  $hasFeatureDivs.forEach(($div, i) => {
    const val = feature.tiers[i];
    if (val === 1) $div.innerHTML = $tplCheckIcon.innerHTML;
    else if (val === 0) $div.innerHTML = '-';
    else $div.innerHTML = val;
  });

  return $feature;
}

function insertFeatureData() {
  const $table = document.getElementById(id.tbody);
  const $tplGroup = document.getElementById(id.tplGroup) as HTMLTemplateElement | null;
  const $tplFeature = document.getElementById(id.tplFeature) as HTMLTemplateElement | null;
  const $tplCheckIcon = document.getElementById(id.tplCheckIcon) as HTMLTemplateElement | null;
  const $tplInfoIcon = document.getElementById(id.tplInfoIcon) as HTMLTemplateElement | null;

  if (!$table || !$tplGroup || !$tplFeature || !$tplCheckIcon || !$tplInfoIcon) return;

  window.PM__FEATURE_DATA.forEach((group) => {
    const $group = fillGroupTpl(group, $tplGroup);
    if (!$group) return;
    const $tbody = $group.querySelector('tbody');
    if (!$tbody) return;
    $table.appendChild($group);

    group.items.forEach((feature) => {
      const $feature = fillFeatureTpl(feature, $tplFeature, $tplCheckIcon, $tplInfoIcon);
      if ($feature) $tbody.appendChild($feature);
    });
  });
}

function setupIntersectionObserver() {
  const handleIntersect = (entries: IntersectionObserverEntry[]) => {
    entries.forEach((e) => {
      const $shadows = document.querySelectorAll(sel(cls.scrollShadow));
      const isLeftPixel = e.target.classList.contains(cls.intersectionPixelLeft);

      $shadows.forEach(($shadow) => {
        const shadowCls = isLeftPixel ? cls.scrollShadowLeftVisible : cls.scrollShadowRightVisible;

        if (e.isIntersecting) $shadow.classList.remove(shadowCls);
        else $shadow.classList.add(shadowCls);
      });
    });
  };

  const observer = new IntersectionObserver(handleIntersect, {
    root: null,
    threshold: [0, 1],
  });

  const $pixels = document.querySelectorAll(sel(cls.intersectionPixel));
  $pixels.forEach(($p) => observer.observe($p));
}

document.addEventListener('DOMContentLoaded', () => {
  insertFeatureData();
  setupIntersectionObserver();
});
