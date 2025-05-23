type TourPaginationProps = {
  currentPage: number;
  totalResults: number;
  pageSize: number;
  groupSize: number;
  onPageChange: (page: number) => void;
};

const TourPagination = ({
  currentPage,
  totalResults,
  pageSize,
  groupSize,
  onPageChange,
}: TourPaginationProps) => {
  const pageGroup = Math.ceil(currentPage / groupSize);
  const totalPage = Math.ceil(totalResults / pageSize);
  const lastPage = Math.min(totalPage, pageGroup * groupSize);
  const firstPage =
    lastPage - (groupSize - 1) > 0 ? lastPage - (groupSize - 1) : 1;

  return (
    <ul className="pagination">
      <li
        className={currentPage === 1 ? "disabled" : ""}
        onClick={() => currentPage > 1 && onPageChange(1)}
      >
        <a>&laquo;</a>
      </li>

      <li
        className={currentPage === 1 ? "disabled" : ""}
        onClick={() => currentPage > 1 && onPageChange(currentPage - 1)}
      >
        <a>&lt;</a>
      </li>

      {Array.from({ length: lastPage - firstPage + 1 }, (_, i) => {
        const pageNum = firstPage + i;
        return (
          <li
            key={pageNum}
            className={`page-item ${pageNum === currentPage ? "active" : ""}`}
            onClick={() => onPageChange(pageNum)}
          >
            <a>{pageNum}</a>
          </li>
        );
      })}

      <li
        className={currentPage === totalPage ? "disabled" : ""}
        onClick={() => currentPage < totalPage && onPageChange(currentPage + 1)}
      >
        <a>&gt;</a>
      </li>

      <li
        className={currentPage === totalPage ? "disabled" : ""}
        onClick={() => currentPage < totalPage && onPageChange(totalPage)}
      >
        <a>&raquo;</a>
      </li>
    </ul>
  );
};

export default TourPagination;
