from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.models.project import Project
from app.models.user import User
from app.routers.deps import get_current_user
from app.schemas.project import ProjectCreate, ProjectOut, PullRequestOut
from app.services import github_service
from app.services.crypto_service import decrypt_pat, encrypt_pat

router = APIRouter(prefix="/projects", tags=["projects"])


def _get_owned_project(db: Session, project_id: int, user: User) -> Project:
    project = db.get(Project, project_id)
    if project is None or project.user_id != user.id:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Project not found")
    return project


@router.post("", response_model=ProjectOut, status_code=status.HTTP_201_CREATED)
def create_project(
    payload: ProjectCreate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)
) -> Project:
    try:
        github_service.validate_repo_access(payload.github_pat, payload.repo_owner, payload.repo_name)
    except github_service.GitHubAuthError as exc:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(exc)) from exc
    except github_service.GitHubNotFoundError as exc:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(exc)) from exc

    existing = (
        db.query(Project)
        .filter(
            Project.user_id == current_user.id,
            Project.repo_owner == payload.repo_owner,
            Project.repo_name == payload.repo_name,
        )
        .first()
    )
    if existing:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Project already connected")

    project = Project(
        user_id=current_user.id,
        repo_owner=payload.repo_owner,
        repo_name=payload.repo_name,
        encrypted_pat=encrypt_pat(payload.github_pat),
    )
    db.add(project)
    db.commit()
    db.refresh(project)
    return project


@router.get("", response_model=list[ProjectOut])
def list_projects(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)) -> list[Project]:
    return db.query(Project).filter(Project.user_id == current_user.id).order_by(Project.created_at.desc()).all()


@router.delete("/{project_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_project(
    project_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)
) -> None:
    project = _get_owned_project(db, project_id, current_user)
    db.delete(project)
    db.commit()


@router.get("/{project_id}/pulls", response_model=list[PullRequestOut])
def list_pull_requests(
    project_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)
) -> list[dict]:
    project = _get_owned_project(db, project_id, current_user)
    pat = decrypt_pat(project.encrypted_pat)
    try:
        return github_service.list_open_pull_requests(pat, project.repo_owner, project.repo_name)
    except github_service.GitHubAuthError as exc:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(exc)) from exc


@router.get("/{project_id}/pulls/{pr_number}", response_model=PullRequestOut)
def get_pull_request(
    project_id: int,
    pr_number: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> dict:
    project = _get_owned_project(db, project_id, current_user)
    pat = decrypt_pat(project.encrypted_pat)
    try:
        pr = github_service.get_pull_request(pat, project.repo_owner, project.repo_name, pr_number)
    except github_service.GitHubAuthError as exc:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(exc)) from exc
    except github_service.GitHubNotFoundError as exc:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(exc)) from exc
    return pr
