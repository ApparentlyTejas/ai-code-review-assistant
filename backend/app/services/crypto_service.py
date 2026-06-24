from cryptography.fernet import Fernet

from app.core.config import settings

_fernet = Fernet(settings.pat_encryption_key.encode())


def encrypt_pat(pat: str) -> str:
    return _fernet.encrypt(pat.encode()).decode()


def decrypt_pat(encrypted_pat: str) -> str:
    return _fernet.decrypt(encrypted_pat.encode()).decode()
