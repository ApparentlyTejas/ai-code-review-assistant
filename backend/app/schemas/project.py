from datetime import datetime

from pydantic import BaseModel, ConfigDict, Field


class ProjectCreate(BaseModel):
    repo_owner: str = Field(min_length=1, max_length=255)
    repo_name: str = Field(min_length=1, max_length=255)
    github_pat: str = Field(min_length=1)


class ProjectFromGitHub(BaseModel):
    repo_owner: str = Field(min_length=1, max_length=255)
    repo_name: str = Field(min_length=1, max_length=255)


class ProjectOut(BaseModel):
    id: int
    repo_owner: str
    repo_name: str
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


class PullRequestOut(BaseModel):
    number: int
    title: str
    url: str
    author: str
    updated_at: str
