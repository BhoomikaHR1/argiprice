from sqlalchemy import Column, Integer, String, Boolean
from app.core.database import Base


class Crop(Base):
    __tablename__ = "crops"

    id = Column(Integer, primary_key=True, index=True)
    name_en = Column(String(100), nullable=False)
    name_kn = Column(String(100))
    category = Column(String(100))
    has_msp = Column(Boolean, default=False)