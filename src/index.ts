import { Feature } from './types/Feature';
import { FeatureGroup } from './types/FeatureGroup';
import './index.css';
import { ActionsRow } from './types/ActionsRow';

declare global {
  interface Window {
    PM__FEATURE_DATA: (FeatureGroup | ActionsRow)[];
  }
}

const id = {
  tbody: 'pm--tbody',
  tplGroup: 'pm--tpl-group',
  tplFeature: 'pm--tpl-feature',
  tplCheckIcon: 'pm--tpl-check-icon',
  tplInfoIcon: 'pm--tpl-info-icon',
  tplActionsRow: 'pm--tpl-actions-row',
  btnToggleDetails: 'pm--toggle-details',
};

const cls = {
  group: 'pm--group',
  groupTitle: 'pm--group__title',
  actionBtn: 'pm--action-btn',
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

function isActionsRow(data: unknown): data is ActionsRow {
  return !!data && typeof data === 'object' && 'name' in data && data.name === 'ACTIONS';
}

function getFeatureTplNodes($tplFeature: HTMLTemplateElement) {
  const $feature = getClonedTemplateContent($tplFeature);
  const $title = $feature.querySelector(sel(cls.featureTitle));
  const $description = $feature.querySelector(sel(cls.featureDescription));
  const $hasFeatureDivs = $feature.querySelectorAll(sel(cls.hasFeature));

  if (!$title || !$description || !$hasFeatureDivs.length) return null;
  return { $feature, $title, $description, $hasFeatureDivs };
}

function fillFeatureTpl(
  feature: Feature,
  $tplFeature: HTMLTemplateElement,
  $tplCheckIcon: HTMLTemplateElement,
  $tplInfoIcon: HTMLTemplateElement,
) {
  const nodes = getFeatureTplNodes($tplFeature);
  if (!nodes) return;
  const { $feature, $title, $description, $hasFeatureDivs } = nodes;

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

function fillActionsRowTpl(actionRow: ActionsRow, $tplActionsRow: HTMLTemplateElement) {
  const $actionsRow = getClonedTemplateContent($tplActionsRow);
  const $actionBtns = $actionsRow.querySelectorAll(
    sel(cls.actionBtn),
  ) as NodeListOf<HTMLAnchorElement>;
  if (!$actionBtns.length) return console.warn('Could not find action btns');

  // action btns
  $actionBtns.forEach(($btn, i) => {
    const action = actionRow.actions[i];
    $btn.href = action.href;
    $btn.innerHTML = action.label;
  });

  return $actionsRow;
}

function insertFeatureData() {
  const $table = document.getElementById(id.tbody);
  const $tplActionsRow = document.getElementById(id.tplActionsRow) as HTMLTemplateElement | null;
  const $tplGroup = document.getElementById(id.tplGroup) as HTMLTemplateElement | null;
  const $tplFeature = document.getElementById(id.tplFeature) as HTMLTemplateElement | null;
  const $tplCheckIcon = document.getElementById(id.tplCheckIcon) as HTMLTemplateElement | null;
  const $tplInfoIcon = document.getElementById(id.tplInfoIcon) as HTMLTemplateElement | null;

  if (!$table || !$tplActionsRow || !$tplGroup || !$tplFeature || !$tplCheckIcon || !$tplInfoIcon) {
    return console.warn('Could not find all templates');
  }

  window.PM__FEATURE_DATA.forEach((group) => {
    console.log(isActionsRow(group), group);
    if (isActionsRow(group)) {
      const $actionsRow = fillActionsRowTpl(group, $tplActionsRow);
      if (!$actionsRow) return console.warn('ActionsRow was not filled correctly');
      $table.appendChild($actionsRow);
      return;
    }

    // it's a group
    const $group = fillGroupTpl(group, $tplGroup);
    if (!$group) return console.warn('Group was not filled correctly');

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
