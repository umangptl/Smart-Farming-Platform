from app.utils.db_util import configure_db
from app import create_app
from app.routes.task_routes import task_bp


app = create_app()

configure_db(app)

app.register_blueprint(task_bp)
if __name__ == "__main__":
    app.run(debug=True)
