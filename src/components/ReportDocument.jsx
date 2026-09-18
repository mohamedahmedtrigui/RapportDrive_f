import EmptyState from './EmptyState'
import { AlertIcon, EditIcon, TrashIcon } from './icons'

export default function ReportDocument({
  report,
  actions,
  onMarkSummaryRead,
  markingRead,
  onEditEntry,
  onDeleteEntry,
  showAiAnalysis = true,
}) {
  const isRead = Boolean(report.ai_summary_read_at)

  return (
    <div className="report-doc" id="report-doc">
      <div className="report-doc-header">
        <div>
          <h1>{report.titre}</h1>
          <div className="report-doc-meta">
            <span>Date : {report.date_rapport?.slice(0, 10)}</span>
            <span>Dispatcher : {report.dispatcher?.nom ?? '—'}</span>
            <span>{report.report_entries.length} entrée(s)</span>
            <span className={`badge statut-${report.statut}`}>{report.statut}</span>
          </div>
        </div>
        {actions && <div className="report-doc-actions">{actions}</div>}
      </div>

      {showAiAnalysis && report.ai_summary && (
        <div className={`ai-summary${isRead ? ' read' : ''}`}>
          <div className="ai-summary-head">
            <AlertIcon width={18} height={18} className={isRead ? '' : 'icon-pulse'} />
            <strong>Récap IA — éléments à surveiller</strong>
          </div>
          <p>{report.ai_summary}</p>
          {onMarkSummaryRead && (
            <label className="ai-summary-check">
              <input
                type="checkbox"
                checked={isRead}
                disabled={isRead || markingRead}
                onChange={onMarkSummaryRead}
              />
              {isRead ? 'Marqué comme lu' : 'Marquer comme lu'}
            </label>
          )}
        </div>
      )}

      {report.report_entries.length === 0 ? (
        <EmptyState>Ce rapport ne contient encore aucune entrée.</EmptyState>
      ) : (
        report.report_entries.map((entry) => (
          <article key={entry.id} className="report-entry">
            <div className="report-entry-row">
              <p>
                <strong>{entry.course_id}</strong> : {entry.description}
                {showAiAnalysis && entry.categorie && (
                  <span className="badge report-entry-tag">{entry.categorie}</span>
                )}
                {showAiAnalysis && entry.severite && (
                  <span className={`badge severite-${entry.severite} report-entry-tag`}>{entry.severite}</span>
                )}
              </p>
              {(onEditEntry || onDeleteEntry) && (
                <div className="table-actions">
                  {onEditEntry && (
                    <button
                      type="button"
                      className="icon-btn small"
                      onClick={() => onEditEntry(entry)}
                      aria-label={`Modifier l'entrée ${entry.course_id}`}
                    >
                      <EditIcon width={16} height={16} />
                    </button>
                  )}
                  {onDeleteEntry && (
                    <button
                      type="button"
                      className="icon-btn small danger-hover"
                      onClick={() => onDeleteEntry(entry)}
                      aria-label={`Supprimer l'entrée ${entry.course_id}`}
                    >
                      <TrashIcon width={16} height={16} />
                    </button>
                  )}
                </div>
              )}
            </div>
            {(entry.driver || entry.client_nom || entry.zone) && (
              <p className="report-entry-driver">
                {entry.driver && `Chauffeur : ${entry.driver.nom}`}
                {entry.driver && entry.client_nom && ' · '}
                {entry.client_nom && `Client : ${entry.client_nom}`}
                {(entry.driver || entry.client_nom) && entry.zone && ' · '}
                {entry.zone && `Zone : ${entry.zone.nom}`}
              </p>
            )}
          </article>
        ))
      )}
    </div>
  )
}
