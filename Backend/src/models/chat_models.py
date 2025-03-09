class General(BaseModel):
    id: str
    title: str
    description: str
    uid: str
    created_at: str


class Issue(BaseModel):
    id: str
    title: str
    description: str
    uid: str
    created_at: str

class IssueReply(BaseModel):
    id: str
    issue_id: str
    title: str
    description: str
    uid: str
    created_at: str