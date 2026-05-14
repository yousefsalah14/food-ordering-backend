export interface PaginationMeta {
  totalItems: number;
  currentPage: number;
  totalPages: number;
  nextPage: number | null;
  prevPage: number | null;
  pageSize: number;
}

export function getPaginationData(
  totalItems: number,
  currentPage: number,
  pageSize: number,
): PaginationMeta {
  const totalPages = Math.max(Math.ceil(totalItems / pageSize), 1);

  return {
    totalItems,
    currentPage,
    totalPages,
    nextPage: currentPage < totalPages ? currentPage + 1 : null,
    prevPage: currentPage > 1 ? currentPage - 1 : null,
    pageSize,
  };
}
