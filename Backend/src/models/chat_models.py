from pydantic import BaseModel

class General(BaseModel):
    # Remove id since MongoDB will generate it
    title: str
    description: str
    uid: str
    created_at: str

class Issue(BaseModel):
    # Remove id since MongoDB will generate it
    title: str
    description: str
    uid: str
    created_at: str

class IssueReply(BaseModel):
    # Remove id since MongoDB will generate it
    issue_id: str
    title: str
    description: str
    uid: str
    created_at: str