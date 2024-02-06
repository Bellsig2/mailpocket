from sqlalchemy import func

from backend.common.database.connector import MysqlCRUDTemplate
from backend.common.database.model import MailModel, NewsLetterModel, SubscribeModel
from backend.common.exceptions import UnknownFromEamilException
from backend.mail.domain import Mail
from backend.newsletter.domain import NewsLetter
from backend.user.domain import User


class NewsLetterRepository:
    class LoadNewslettersWithFirstMail(MysqlCRUDTemplate):
        def execute(self):
            newsletters = list()
            newsletter_models = self.session.query(NewsLetterModel).all()
            for newsletter_model in newsletter_models:
                mail = None
                mail_model = (
                    self.session.query(MailModel)
                    .filter(MailModel.newsletter_id == newsletter_model.id)
                    .first()
                )
                if mail_model:
                    mail = Mail(
                        id=mail_model.id,
                        s3_object_key=mail_model.s3_object_key,
                        subject=mail_model.subject,
                        summary_list=mail_model.summary_list,
                    )
                newsletter = NewsLetter(
                    id=newsletter_model.id,
                    name=newsletter_model.name,
                    from_email=newsletter_model.from_email,
                    category=newsletter_model.category,
                    send_date=newsletter_model.send_date,
                    mail=mail,
                )
                newsletters.append(newsletter)
            return newsletters

        def run(self) -> list[NewsLetter]:
            return super().run()

    class LoadNewsLetterByID(MysqlCRUDTemplate):
        def __init__(self, id) -> None:
            self.id = id
            super().__init__()

        def execute(self):
            newsletter_model = (
                self.session.query(NewsLetterModel)
                .filter(NewsLetterModel.id == self.id)
                .first()
            )
            if not newsletter_model:
                return None
            newsletter = NewsLetter(
                id=newsletter_model.id,
                name=newsletter_model.name,
                from_email=newsletter_model.from_email,
                category=newsletter_model.category,
                send_date=newsletter_model.send_date,
            )
            return newsletter

    class LoadNewsLetterByFromEmail(MysqlCRUDTemplate):
        def __init__(self, from_email) -> None:
            self.from_email = from_email
            super().__init__()

        def execute(self):
            newsletter_model = (
                self.session.query(NewsLetterModel)
                .filter(NewsLetterModel.from_email == self.from_email)
                .first()
            )
            if not newsletter_model:
                raise UnknownFromEamilException(self.from_email)
            newsletter = NewsLetter(
                id=newsletter_model.id,
                name=newsletter_model.name,
                from_email=newsletter_model.from_email,
                category=newsletter_model.category,
                send_date=newsletter_model.send_date,
            )
            return newsletter

        def run(self) -> NewsLetter:
            return super().run()

    class LoadSubscribeNewsLettersByUser(MysqlCRUDTemplate):
        def __init__(self, user: User) -> None:
            self.user = user
            super().__init__()

        def execute(self):
            newsletter_list = list()
            subscribe_models = (
                self.session.query(SubscribeModel)
                .filter(SubscribeModel.user_id == self.user.id)
                .all()
            )
            if not subscribe_models:
                return None
            for subscribe_model in subscribe_models:
                newsletter_id = subscribe_model.newsletter_id
                newsletter_model = (
                    self.session.query(NewsLetterModel)
                    .filter(NewsLetterModel.id == newsletter_id)
                    .first()
                )
                newsletter = NewsLetter(
                    id=newsletter_model.id,
                    name=newsletter_model.name,
                    from_email=newsletter_model.from_email,
                    category=newsletter_model.category,
                    send_date=newsletter_model.send_date,
                )
                newsletter_list.append(newsletter)
            return newsletter_list

    class LoadSubscribeAbleNewsLettersByUser(MysqlCRUDTemplate):
        def __init__(self, user: User) -> None:
            self.user = user
            super().__init__()

        def execute(self):
            newsletter_list = list()
            subscribe_models = (
                self.session.query(SubscribeModel.newsletter_id)
                .filter(SubscribeModel.user_id == self.user.id)
                .all()
            )
            newsletter_ids = [
                subscribe_model[0] for subscribe_model in subscribe_models
            ]
            # newsletter_models = (
            #     self.session.query(NewsLetterModel)
            #     .filter(NewsLetterModel.id.not_in(newsletter_ids))
            #     .all()
            # )
            newsletter_models = (
                self.session.query(NewsLetterModel)
                .join(
                    SubscribeModel, NewsLetterModel.id == SubscribeModel.newsletter_id
                )
                .group_by(NewsLetterModel.id)
                .order_by(func.count(SubscribeModel.newsletter_id).desc())
                .filter(NewsLetterModel.id.not_in(newsletter_ids))
                .all()
            )
            for newsletter_model in newsletter_models:
                mail = None
                mail_model = (
                    self.session.query(MailModel)
                    .filter(MailModel.newsletter_id == newsletter_model.id)
                    .first()
                )
                if mail_model:
                    mail = Mail(
                        id=mail_model.id,
                        s3_object_key=mail_model.s3_object_key,
                        subject=mail_model.subject,
                        summary_list=mail_model.summary_list,
                    )
                newsletter = NewsLetter(
                    id=newsletter_model.id,
                    name=newsletter_model.name,
                    from_email=newsletter_model.from_email,
                    category=newsletter_model.category,
                    send_date=newsletter_model.send_date,
                    mail=mail,
                )
                newsletter_list.append(newsletter)
            return newsletter_list

    class LoadSubscribedNewsLettersByUser(MysqlCRUDTemplate):
        def __init__(self, user: User, in_mail) -> None:
            self.user = user
            self.in_mail = in_mail
            super().__init__()

        def execute(self):
            newsletter_list = list()
            subscribe_models = (
                self.session.query(SubscribeModel.newsletter_id)
                .filter(SubscribeModel.user_id == self.user.id)
                .all()
            )
            newsletter_ids = [
                subscribe_model[0] for subscribe_model in subscribe_models
            ]
            # newsletter_models = (
            #     self.session.query(NewsLetterModel)
            #     .filter(NewsLetterModel.id.in_(newsletter_ids))
            #     .all()
            # )
            newsletter_models = (
                self.session.query(NewsLetterModel)
                .join(
                    SubscribeModel, NewsLetterModel.id == SubscribeModel.newsletter_id
                )
                .group_by(NewsLetterModel.id)
                .order_by(func.count(SubscribeModel.newsletter_id).desc())
                .filter(NewsLetterModel.id.in_(newsletter_ids))
                .all()
            )
            for newsletter_model in newsletter_models:
                mail = None
                # 이론상 쿼리를 뉴스레터만큼 81번 보내는건데.. 리펙토링 생각해보기
                if self.in_mail:
                    mail_model = (
                        self.session.query(MailModel)
                        .filter(MailModel.newsletter_id == newsletter_model.id)
                        .first()
                    )
                    if mail_model:
                        mail = Mail(
                            id=mail_model.id,
                            s3_object_key=mail_model.s3_object_key,
                            subject=mail_model.subject,
                            summary_list=mail_model.summary_list,
                        )
                newsletter = NewsLetter(
                    id=newsletter_model.id,
                    name=newsletter_model.name,
                    from_email=newsletter_model.from_email,
                    category=newsletter_model.category,
                    send_date=newsletter_model.send_date,
                    mail=mail,
                )
                newsletter_list.append(newsletter)
            return newsletter_list

    class LoadNewsLetterByIDWithMails(MysqlCRUDTemplate):
        def __init__(self, id) -> None:
            self.id = id
            super().__init__()

        def execute(self):
            newsletter_model = (
                self.session.query(NewsLetterModel)
                .filter(NewsLetterModel.id == self.id)
                .first()
            )
            if not newsletter_model:
                return None
            mail_list = list()
            mail_models = (
                self.session.query(MailModel)
                .filter(MailModel.newsletter_id == newsletter_model.id)
                .all()
            )
            for mail_model in mail_models:
                mail = Mail(
                    id=mail_model.id,
                    s3_object_key=mail_model.s3_object_key,
                    subject=mail_model.subject,
                )
                mail_list.append(mail)
            newsletter = NewsLetter(
                id=newsletter_model.id,
                name=newsletter_model.name,
                from_email=newsletter_model.from_email,
                category=newsletter_model.category,
                send_date=newsletter_model.send_date,
                mails=mail_list,
            )
            return newsletter
