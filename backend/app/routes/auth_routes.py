from flask import Blueprint, request, jsonify
from flask_jwt_extended import (
    create_access_token,
    create_refresh_token,
    jwt_required,
    get_jwt_identity,
    get_jwt
)

from app.models.users import User, TokenBlocklist
from app.utils.db_util import db

auth_bp = Blueprint('auth', __name__)


@auth_bp.route('/register', methods=['POST'])
def register():
    data = request.get_json()
    if User.query.filter_by(username=data['username']).first():
        return jsonify(msg="Username taken"), 400
    if User.query.filter_by(email=data['email']).first():
        return jsonify(msg="Email already registered"), 400

    user = User(
        username=data['username'],
        email=data['email'],
        first_name=data.get('first_name'),
        last_name=data.get('last_name'),
        address=data.get('address'),
        city=data.get('city'),
        country=data.get('country'),
        postal_code=data.get('postal_code'),
        about_me=data.get('about_me'),
        phone=data.get('phone'),
        role=data.get('role', 'Staff')
    )
    user.set_password(data['password'])
    db.session.add(user)
    db.session.commit()

    access = create_access_token(identity=str(user.id))
    refresh = create_refresh_token(identity=str(user.id))
    return jsonify(access_token=access, refresh_token=refresh), 201


@auth_bp.route('/login', methods=['POST'])
def login():
    data = request.get_json()
    user = User.query.filter_by(username=data['username']).first()
    if not user or not user.check_password(data['password']):
        return jsonify(msg="Bad credentials"), 401

    access = create_access_token(identity=str(user.id))
    refresh = create_refresh_token(identity=str(user.id))
    return jsonify(access_token=access, refresh_token=refresh)


@auth_bp.route('/refresh', methods=['POST'])
@jwt_required(refresh=True)
def refresh():
    user_id = get_jwt_identity()
    new_access = create_access_token(identity=user_id)
    return jsonify(access_token=new_access)


@auth_bp.route('/logout', methods=['DELETE'])
@jwt_required()
def logout():
    jti = get_jwt()['jti']
    db.session.add(TokenBlocklist(jti=jti))
    db.session.commit()
    return jsonify(msg="Access token revoked"), 200
