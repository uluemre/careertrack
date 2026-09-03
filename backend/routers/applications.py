from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session

import models
from database import SessionLocal
from dependencies import get_current_user
from schemas import (
    ApplicationCreate,
    ApplicationResponse,
    ApplicationStatus,
    ApplicationUpdate,
)

router = APIRouter(
    prefix="/applications",
    tags=["Applications"],
    redirect_slashes=False,
)


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


@router.post("", response_model=ApplicationResponse)
def create_application(
    application: ApplicationCreate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    new_application = models.Application(
        user_id=current_user.id,
        company=application.company,
        position=application.position,
        status=application.status,
        application_date=application.application_date,
        notes=application.notes,
    )

    db.add(new_application)
    db.commit()
    db.refresh(new_application)

    return new_application


@router.get("", response_model=list[ApplicationResponse])
def get_applications(
    status: ApplicationStatus | None = Query(default=None),
    search: str | None = Query(default=None, min_length=1, max_length=100),
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    query = db.query(models.Application).filter(
        models.Application.user_id == current_user.id
    )

    if status is not None:
        query = query.filter(models.Application.status == status)

    if search is not None:
        search_term = f"%{search.strip()}%"
        query = query.filter(
            models.Application.company.ilike(search_term)
            | models.Application.position.ilike(search_term)
        )

    return query.order_by(
        models.Application.application_date.desc().nullslast(),
        models.Application.created_at.desc()
    ).all()


@router.get("/{application_id}", response_model=ApplicationResponse)
def get_application(
    application_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    application = db.query(models.Application).filter(
        models.Application.id == application_id,
        models.Application.user_id == current_user.id
    ).first()

    if application is None:
        raise HTTPException(
            status_code=404,
            detail="Application not found"
        )

    return application


@router.put("/{application_id}", response_model=ApplicationResponse)
def update_application(
    application_id: int,
    application: ApplicationUpdate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    existing_application = db.query(models.Application).filter(
        models.Application.id == application_id,
        models.Application.user_id == current_user.id
    ).first()

    if existing_application is None:
        raise HTTPException(
            status_code=404,
            detail="Application not found"
        )

    existing_application.company = application.company
    existing_application.position = application.position
    existing_application.status = application.status
    existing_application.application_date = application.application_date
    existing_application.notes = application.notes

    db.commit()
    db.refresh(existing_application)

    return existing_application


@router.delete("/{application_id}")
def delete_application(
    application_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    existing_application = db.query(models.Application).filter(
        models.Application.id == application_id,
        models.Application.user_id == current_user.id
    ).first()

    if existing_application is None:
        raise HTTPException(
            status_code=404,
            detail="Application not found"
        )

    db.delete(existing_application)
    db.commit()

    return {
        "message": "Application deleted successfully"
    }