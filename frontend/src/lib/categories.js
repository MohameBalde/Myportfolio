// Catégories des projets : la valeur stockée en base reste en anglais, l'affichage est en français.
export const CATEGORY_LABELS = {
  Network: 'Réseau',
  System: 'Système',
  Telecom: 'Télécom',
  Web: 'Web',
};

export const categoryLabel = (category) => CATEGORY_LABELS[category] || category;
