import { Language } from '../enums/language.enum';

const paymentMethodLabels: Record<Language, Record<string, string>> = {
  [Language.EN]: {
    cash_on_delivery: 'Cash on Delivery',
    card: 'Online Payment',
  },
  [Language.AR]: {
    cash_on_delivery: 'الدفع عند الاستلام',
    card: 'الدفع الإلكتروني',
  },
};

const paymentStatusLabels: Record<Language, Record<string, string>> = {
  [Language.EN]: {
    pending: 'Pending',
    paid: 'Paid',
    failed: 'Failed',
    refunded: 'Refunded',
  },
  [Language.AR]: {
    pending: 'قيد الانتظار',
    paid: 'تم الدفع',
    failed: 'فشل الدفع',
    refunded: 'تم رد المبلغ',
  },
};

const orderStatusLabels: Record<Language, Record<string, string>> = {
  [Language.EN]: {
    pending: 'Pending',
    confirmed: 'Confirmed',
    preparing: 'Preparing',
    out_for_delivery: 'Out for delivery',
    delivered: 'Delivered',
    cancelled: 'Cancelled',
  },
  [Language.AR]: {
    pending: 'قيد الانتظار',
    confirmed: 'تم التأكيد',
    preparing: 'قيد التحضير',
    out_for_delivery: 'خرج للتوصيل',
    delivered: 'تم التسليم',
    cancelled: 'تم الإلغاء',
  },
};

function getPreferredValue(
  englishValue: unknown,
  arabicValue: unknown,
  language: Language,
) {
  if (language === Language.AR) {
    return arabicValue ?? englishValue ?? null;
  }

  return englishValue ?? arabicValue ?? null;
}

export function normalizeLanguage(languageHeader?: string | string[]) {
  const value = Array.isArray(languageHeader) ? languageHeader[0] : languageHeader;
  const normalized = value?.toLowerCase() ?? Language.EN;

  return normalized.startsWith(Language.AR) ? Language.AR : Language.EN;
}

export function localizeResponse<T>(data: T, language: Language): T {
  return localizeResponseInternal(data, language, new WeakSet<object>(), 0);
}

function localizeResponseInternal<T>(
  data: T,
  language: Language,
  visited: WeakSet<object>,
  depth: number,
): T {
  if (depth > 8) {
    return undefined as T;
  }

  if (Array.isArray(data)) {
    return data.map((item) =>
      localizeResponseInternal(item, language, visited, depth + 1),
    ) as T;
  }

  if (!data || typeof data !== 'object') {
    return data;
  }

  if (data instanceof Date) {
    return data.toISOString() as T;
  }

  const source = data as Record<string, unknown>;

  if (visited.has(data)) {
    return undefined as T;
  }

  const localized: Record<string, unknown> = {};
  visited.add(data);

  Object.entries(source).forEach(([key, value]) => {
    if (typeof value === 'function') {
      return;
    }

    const localizedValue = localizeResponseInternal(
      value,
      language,
      visited,
      depth + 1,
    );
    if (localizedValue !== undefined) {
      localized[key] = localizedValue;
    }
  });

  if ('nameEn' in source || 'nameAr' in source) {
    localized.name = getPreferredValue(source.nameEn, source.nameAr, language);
  }

  if ('descriptionEn' in source || 'descriptionAr' in source) {
    localized.description = getPreferredValue(
      source.descriptionEn,
      source.descriptionAr,
      language,
    );
  }

  if ('snapshotNameEn' in source || 'snapshotNameAr' in source) {
    localized.snapshotName = getPreferredValue(
      source.snapshotNameEn,
      source.snapshotNameAr,
      language,
    );
  }

  if (typeof source.status === 'string') {
    localized.statusLabel =
      orderStatusLabels[language][source.status] ??
      paymentStatusLabels[language][source.status] ??
      source.status;
  }

  if (typeof source.paymentMethod === 'string') {
    localized.paymentMethodLabel =
      paymentMethodLabels[language][source.paymentMethod] ?? source.paymentMethod;
  }

  if (typeof source.method === 'string') {
    localized.methodLabel =
      paymentMethodLabels[language][source.method] ?? source.method;
  }

  visited.delete(data);

  return localized as T;
}
