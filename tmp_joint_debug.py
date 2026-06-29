import asyncio
import traceback

from sqlalchemy import select

from app.core.database import AsyncSessionLocal
from app.models.user import User
from app.routers.users import (
    JointCommunityCreateRequest,
    create_joint_community_entry,
)


async def main():
    async with AsyncSessionLocal() as db:
        user = (await db.execute(select(User).where(User.phone == "9876543213"))).scalar_one()
        body = JointCommunityCreateRequest(
            crop_id=20,
            quantity=10,
            unit="kg",
            village_name="hassan",
        )
        try:
            result = await create_joint_community_entry(body=body, user=user, db=db)
            print(result)
        except Exception:
            traceback.print_exc()


asyncio.run(main())
