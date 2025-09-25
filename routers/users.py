from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Optional
from database import get_db
from models import User as UserModel
from schemas import UserCreate, UserUpdate, User
from auth import get_current_active_user, get_password_hash

router = APIRouter(prefix="/users", tags=["users"])

@router.post("/", response_model=User, status_code=status.HTTP_201_CREATED)
async def create_user(
    user: UserCreate,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_active_user)
):
    """Créer un nouvel utilisateur"""
    # Vérifier que l'utilisateur actuel peut gérer les utilisateurs
    if not current_user.can_manage_users and current_user.role != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Vous n'avez pas les permissions pour créer des utilisateurs"
        )
    
    # Vérifier si l'utilisateur existe déjà
    if db.query(UserModel).filter(UserModel.username == user.username).first():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Ce nom d'utilisateur existe déjà"
        )
    
    if db.query(UserModel).filter(UserModel.email == user.email).first():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cet email existe déjà"
        )
    
    # Créer le nouvel utilisateur
    hashed_password = get_password_hash(user.password)
    db_user = UserModel(
        username=user.username,
        email=user.email,
        full_name=user.full_name,
        hashed_password=hashed_password,
        role=user.role,
        can_access_purchases=user.can_access_purchases,
        can_access_stock=user.can_access_stock,
        can_access_vehicles=user.can_access_vehicles,
        can_access_maintenance=user.can_access_maintenance,
        can_access_suppliers=user.can_access_suppliers,
        can_access_service_providers=user.can_access_service_providers,
        can_access_reports=user.can_access_reports,
        can_manage_users=user.can_manage_users
    )
    
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user

@router.get("/", response_model=List[User])
async def get_users(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_active_user)
):
    """Récupérer la liste des utilisateurs"""
    # Vérifier que l'utilisateur actuel peut gérer les utilisateurs
    if not current_user.can_manage_users and current_user.role != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Vous n'avez pas les permissions pour voir les utilisateurs"
        )
    
    users = db.query(UserModel).offset(skip).limit(limit).all()
    return users

@router.get("/{user_id}", response_model=User)
async def get_user(
    user_id: int,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_active_user)
):
    """Récupérer un utilisateur par ID"""
    # Vérifier que l'utilisateur actuel peut gérer les utilisateurs
    if not current_user.can_manage_users and current_user.role != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Vous n'avez pas les permissions pour voir les utilisateurs"
        )
    
    user = db.query(UserModel).filter(UserModel.id == user_id).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Utilisateur non trouvé"
        )
    return user

@router.put("/{user_id}", response_model=User)
async def update_user(
    user_id: int,
    user_update: UserUpdate,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_active_user)
):
    """Mettre à jour un utilisateur"""
    # Vérifier que l'utilisateur actuel peut gérer les utilisateurs
    if not current_user.can_manage_users and current_user.role != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Vous n'avez pas les permissions pour modifier les utilisateurs"
        )
    
    user = db.query(UserModel).filter(UserModel.id == user_id).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Utilisateur non trouvé"
        )
    
    # Mettre à jour les champs fournis
    update_data = user_update.dict(exclude_unset=True)
    
    # Si un nouveau mot de passe est fourni, le hasher
    if "password" in update_data:
        update_data["hashed_password"] = get_password_hash(update_data.pop("password"))
    
    for field, value in update_data.items():
        setattr(user, field, value)
    
    db.commit()
    db.refresh(user)
    return user

@router.delete("/{user_id}")
async def delete_user(
    user_id: int,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_active_user)
):
    """Supprimer un utilisateur"""
    # Vérifier que l'utilisateur actuel peut gérer les utilisateurs
    if not current_user.can_manage_users and current_user.role != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Vous n'avez pas les permissions pour supprimer les utilisateurs"
        )
    
    # Empêcher la suppression de son propre compte
    if user_id == current_user.id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Vous ne pouvez pas supprimer votre propre compte"
        )
    
    user = db.query(UserModel).filter(UserModel.id == user_id).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Utilisateur non trouvé"
        )
    
    db.delete(user)
    db.commit()
    return {"message": "Utilisateur supprimé avec succès"}

