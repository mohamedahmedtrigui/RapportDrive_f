export default function Pagination({ meta, onPageChange }) {
  if (!meta || meta.last_page <= 1) {
    return null
  }

  const { current_page: currentPage, last_page: lastPage, total } = meta

  return (
    <div className="pagination">
      <button
        type="button"
        className="btn secondary"
        disabled={currentPage <= 1}
        onClick={() => onPageChange(currentPage - 1)}
      >
        Précédent
      </button>
      <span className="pagination-info">
        Page {currentPage} / {lastPage}
        {typeof total === 'number' && ` — ${total} résultat(s)`}
      </span>
      <button
        type="button"
        className="btn secondary"
        disabled={currentPage >= lastPage}
        onClick={() => onPageChange(currentPage + 1)}
      >
        Suivant
      </button>
    </div>
  )
}
