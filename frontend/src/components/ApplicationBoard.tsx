import { useState } from "react"
import type { Application, ApplicationStatus } from "../api"

const BOARD_STATUSES: ApplicationStatus[] = [
  "Applied",
  "Interview",
  "Offer",
  "Rejected",
  "Withdrawn",
]

type ApplicationBoardProps = {
  applications: Application[]
  onStatusChange: (
    application: Application,
    newStatus: ApplicationStatus
  ) => void | Promise<void>
}

function ApplicationBoard({
  applications,
  onStatusChange,
}: ApplicationBoardProps) {
  const [dragOverStatus, setDragOverStatus] =
    useState<ApplicationStatus | null>(null)
  const [movingId, setMovingId] = useState<number | null>(null)

  function handleDragStart(
    event: React.DragEvent<HTMLDivElement>,
    applicationId: number
  ) {
    event.dataTransfer.setData("text/plain", String(applicationId))
    event.dataTransfer.effectAllowed = "move"
  }

  function handleDragOver(
    event: React.DragEvent<HTMLDivElement>,
    status: ApplicationStatus
  ) {
    event.preventDefault()
    event.dataTransfer.dropEffect = "move"
    setDragOverStatus(status)
  }

  function handleDragLeave() {
    setDragOverStatus(null)
  }

  async function handleDrop(
    event: React.DragEvent<HTMLDivElement>,
    status: ApplicationStatus
  ) {
    event.preventDefault()
    setDragOverStatus(null)

    const applicationId = Number(event.dataTransfer.getData("text/plain"))
    const application = applications.find((a) => a.id === applicationId)

    if (!application || application.status === status) {
      return
    }

    setMovingId(applicationId)

    try {
      await onStatusChange(application, status)
    } finally {
      setMovingId(null)
    }
  }

  return (
    <div className="board">
      {BOARD_STATUSES.map((status) => {
        const columnApplications = applications.filter(
          (application) => application.status === status
        )

        return (
          <div
            key={status}
            className={
              "board-column board-column-" +
              status.toLowerCase() +
              (dragOverStatus === status ? " board-column-drag-over" : "")
            }
            onDragOver={(event) => handleDragOver(event, status)}
            onDragLeave={handleDragLeave}
            onDrop={(event) => handleDrop(event, status)}
          >
            <div className="board-column-header">
              <h4>{status}</h4>
              <span className="board-column-count">
                {columnApplications.length}
              </span>
            </div>

            <div className="board-column-body">
              {columnApplications.length === 0 ? (
                <p className="board-empty">No applications</p>
              ) : (
                columnApplications.map((application) => (
                  <div
                    key={application.id}
                    className="board-card"
                    draggable
                    onDragStart={(event) =>
                      handleDragStart(event, application.id)
                    }
                    style={{
                      opacity: movingId === application.id ? 0.5 : 1,
                    }}
                  >
                    <p className="board-card-company">
                      {application.company}
                    </p>
                    <p className="board-card-position">
                      {application.position}
                    </p>
                    {application.application_date && (
                      <p className="board-card-date">
                        {application.application_date}
                      </p>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        )
      })}
    </div>
  )
}

export default ApplicationBoard
