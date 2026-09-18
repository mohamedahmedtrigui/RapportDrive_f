import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { getReport, updateReportStatus, analyzeReport, markAiSummaryRead } from '../../api/reports'
import Loading from '../../components/Loading'
import ReportDocument from '../../components/ReportDocument'
import ReportDocumentPrintable from '../../components/ReportDocumentPrintable'
import StatusPipeline from '../../components/StatusPipeline'
import { SparkleIcon, EyeIcon } from '../../components/icons'

export default function ManagerReportDetailPage() {
  const { id } = useParams()
  const [report, setReport] = useState(null)
  const [busy, setBusy] = useState(false)
  const [analyzing, setAnalyzing] = useState(false)
  const [error, setError] = useState(null)
  const [showDocument, setShowDocument] = useState(false)

  const load = () => getReport(id).then(({ data }) => setReport(data))

  useEffect(() => {
    load()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id])

  const handleStatusChange = async (statut) => {
    setBusy(true)
    setError(null)
    try {
      const { data } = await updateReportStatus(id, statut)
      setReport(data)
    } catch {
      setError('Impossible de changer le statut.')
    } finally {
      setBusy(false)
    }
  }

  const handleAnalyze = async () => {
    setBusy(true)
    setAnalyzing(true)
    setError(null)
    try {
      const { data } = await analyzeReport(id)
      setReport(data)
    } catch {
      setError("L'analyse IA a échoué.")
    } finally {
      setBusy(false)
      setAnalyzing(false)
    }
  }

  const handleMarkSummaryRead = async () => {
    setBusy(true)
    setError(null)
    try {
      const { data } = await markAiSummaryRead(id)
      setReport(data)
    } catch {
      setError('Impossible de marquer le récap comme lu.')
    } finally {
      setBusy(false)
    }
  }

  if (!report) {
    return <Loading />
  }

  if (showDocument) {
    return <ReportDocumentPrintable report={report} onClose={() => setShowDocument(false)} />
  }

  return (
    <div>
      {error && (
        <p className="error-text" style={{ marginBottom: 12 }}>
          {error}
        </p>
      )}

      <ReportDocument
        report={report}
        onMarkSummaryRead={handleMarkSummaryRead}
        markingRead={busy}
        actions={
          <>
            <StatusPipeline status={report.statut} onChange={handleStatusChange} disabled={busy} />
            <button type="button" className="btn secondary" onClick={handleAnalyze} disabled={busy}>
              {analyzing ? <span className="spinner" aria-hidden="true" /> : <SparkleIcon width={16} height={16} className="icon-spin-slow" />}
              Analyser avec l'IA
            </button>
            <button type="button" className="btn" onClick={() => setShowDocument(true)}>
              <EyeIcon width={16} height={16} />
              Voir le rapport
            </button>
          </>
        }
      />
    </div>
  )
}
