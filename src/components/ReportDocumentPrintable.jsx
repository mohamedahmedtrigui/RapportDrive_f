import { useEffect } from 'react'
import { PrinterIcon, CloseIcon } from './icons'

const SEVERITE_LABEL = { haute: 'Haute', moyenne: 'Moyenne', faible: 'Faible' }

export default function ReportDocumentPrintable({ report, onClose }) {
  useEffect(() => {
    const onKeyDown = (e) => {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', onKeyDown)
    return () => document.removeEventListener('keydown', onKeyDown)
  }, [onClose])

  const entries = report.report_entries
  const graveCount = entries.filter((e) => e.severite === 'haute').length

  return (
    <div className="print-page document-overlay">
      <div className="print-toolbar">
        <button type="button" className="btn secondary" onClick={onClose}>
          <CloseIcon width={16} height={16} />
          Fermer
        </button>
        <button type="button" className="btn" onClick={() => window.print()}>
          <PrinterIcon width={16} height={16} />
          Imprimer / Enregistrer en PDF
        </button>
      </div>

      <div className="print-document">
        <div className="print-doc-header">
          <img src="/rapport.png" alt="RapportDrive" className="print-doc-logo" />
          <div className="print-doc-company">
            <strong>MiralDrive</strong>
            <span>Rapport d&rsquo;activité chauffeurs</span>
          </div>
          <div className="print-doc-date">Généré le {new Date().toLocaleDateString('fr-FR')}</div>
        </div>

        <h1 className="print-doc-title">{report.titre}</h1>

        <div className="print-doc-meta">
          <div className="print-doc-meta-item">
            <span className="print-doc-meta-label">Date du rapport</span>
            <span>{report.date_rapport?.slice(0, 10)}</span>
          </div>
          <div className="print-doc-meta-item">
            <span className="print-doc-meta-label">Dispatcher</span>
            <span>{report.dispatcher?.nom ?? '—'}</span>
          </div>
          <div className="print-doc-meta-item">
            <span className="print-doc-meta-label">Statut</span>
            <span className={`badge statut-${report.statut}`}>{report.statut}</span>
          </div>
          <div className="print-doc-meta-item">
            <span className="print-doc-meta-label">Entrées</span>
            <span>
              {entries.length} {graveCount > 0 && `(dont ${graveCount} grave${graveCount > 1 ? 's' : ''})`}
            </span>
          </div>
        </div>

        {report.ai_summary && (
          <div className="print-doc-summary">
            <strong>Récap IA — éléments à surveiller</strong>
            <p>{report.ai_summary}</p>
          </div>
        )}

        {entries.length === 0 ? (
          <p className="print-doc-empty">Ce rapport ne contient encore aucune entrée.</p>
        ) : (
          <div className="doc-table-wrap">
            <table className="doc-table">
              <colgroup>
                <col style={{ width: '9%' }} />
                <col style={{ width: '13%' }} />
                <col style={{ width: '11%' }} />
                <col style={{ width: '9%' }} />
                <col style={{ width: '38%' }} />
                <col style={{ width: '10%' }} />
                <col style={{ width: '10%' }} />
              </colgroup>
              <thead>
                <tr>
                  <th>Course</th>
                  <th>Chauffeur</th>
                  <th>Client</th>
                  <th>Zone</th>
                  <th>Description</th>
                  <th>Catégorie</th>
                  <th>Sévérité</th>
                </tr>
              </thead>
              <tbody>
                {entries.map((entry) => (
                  <tr key={entry.id} className={entry.severite === 'haute' ? 'doc-row-grave' : ''}>
                    <td>{entry.course_id}</td>
                    <td>{entry.driver?.nom ?? '—'}</td>
                    <td>{entry.client_nom ?? '—'}</td>
                    <td>{entry.zone?.nom ?? '—'}</td>
                    <td>{entry.description}</td>
                    <td>{entry.categorie ?? '—'}</td>
                    <td>
                      {entry.severite ? (
                        <span className={`badge severite-${entry.severite}`}>{SEVERITE_LABEL[entry.severite]}</span>
                      ) : (
                        '—'
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <div className="print-doc-footer">
          Document généré automatiquement par MiralDrive — {new Date().toLocaleString('fr-FR')}
        </div>
      </div>
    </div>
  )
}
