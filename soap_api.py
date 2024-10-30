from spyne import Application, rpc, ServiceBase, Integer, Unicode
from spyne.protocol.soap import Soap11
from spyne.model.complex import ComplexModel
from spyne.server.wsgi import WsgiApplication
from wsgiref.simple_server import make_server

class User(ComplexModel):
    id = Integer
    name = Unicode
    email = Unicode

users = {
    122: {"id": 122, "name": "Aitana Viudes Forrat", "email": "aitanaviudes@gmail.com"},
    513: {"id": 513, "name": "Nuria Hidalgo Cantizano", "email": "nuriahidalgo@gmail.com"}
}

class UserService(ServiceBase):
    @rpc(Integer, Unicode, Unicode, _returns=Unicode)
    def create_user(ctx, user_id, name, email):
        """Create a new user."""
        if user_id in users:
            return "User already exists"
        users[user_id] = {"id": user_id, "name": name, "email": email}
        return "User created successfully"

    @rpc(Integer, _returns=User)
    def get_user(ctx, user_id):
        """Retrieve a user by ID."""
        user_data = users.get(user_id)
        if user_data:
            return User(id=user_data["id"], name=user_data["name"], email=user_data["email"])
        else:
            raise ValueError("User not found")

    @rpc(Integer, Unicode, Unicode, _returns=Unicode)
    def update_user(ctx, user_id, name, email):
        """Update an existing user's information."""
        if user_id in users:
            users[user_id].update({"name": name, "email": email})
            return "User updated successfully"
        else:
            raise ValueError("User not found")

    @rpc(Integer, _returns=Unicode)
    def delete_user(ctx, user_id):
        """Delete a user by ID."""
        if user_id in users:
            del users[user_id]
            return "User deleted successfully"
        else:
            raise ValueError("User not found")

application = Application(
    [UserService],
    tns="spyne.examples.user",
    in_protocol=Soap11(validator='lxml'),
    out_protocol=Soap11()
)

wsgi_app = WsgiApplication(application)

def add_cors_headers(environ, start_response):
    def cors_start_response(status, headers, exc_info=None):
        headers.append(('Access-Control-Allow-Origin', '*'))
        headers.append(('Access-Control-Allow-Methods', 'POST, GET, OPTIONS'))
        headers.append(('Access-Control-Allow-Headers', 'Content-Type'))
        return start_response(status, headers, exc_info)

    if environ['REQUEST_METHOD'] == 'OPTIONS':
        start_response('200 OK', [
            ('Access-Control-Allow-Origin', '*'),
            ('Access-Control-Allow-Methods', 'POST, GET, OPTIONS'),
            ('Access-Control-Allow-Headers', 'Content-Type')
        ])
        return [b'']

    return wsgi_app(environ, cors_start_response)

if __name__ == '__main__':
    server = make_server('0.0.0.0', 5001, add_cors_headers)
    print("SOAP API running on http://localhost:5001")
    server.serve_forever()
