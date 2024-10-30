from flask import Flask, jsonify, request
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

users = {
    122: {"id": 122, "name": "Aitana Viudes Forrat", "email": "aitanaviudes@gmail.com"},
    513: {"id": 513, "name": "Nuria Hidalgo Cantizano", "email": "nuriahidalgo@gmail.com"}
}

# Create a new user
@app.route('/users', methods=['POST'])
def create_user():
    new_user = request.json
    user_id = new_user.get("id")
    if user_id in users:
        return jsonify({"error": "User already exists"}), 400
    users[user_id] = new_user
    return jsonify(new_user), 201

# Read/Get a user by ID
@app.route('/users/<int:user_id>', methods=['GET'])
def get_user(user_id):
    user = users.get(user_id)
    if user:
        return jsonify(user)
    else:
        return jsonify({"error": "User not found"}), 404

# Update an existing user
@app.route('/users/<int:user_id>', methods=['PUT'])
def update_user(user_id):
    user_data = request.json
    if user_id in users:
        users[user_id].update(user_data)
        return jsonify(users[user_id])
    else:
        return jsonify({"error": "User not found"}), 404

# Delete a user by ID
@app.route('/users/<int:user_id>', methods=['DELETE'])
def delete_user(user_id):
    if user_id in users:
        deleted_user = users.pop(user_id)
        return jsonify(deleted_user)
    else:
        return jsonify({"error": "User not found"}), 404

if __name__ == '__main__':
    app.run(port=5002)
