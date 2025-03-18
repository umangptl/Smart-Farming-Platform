import os
import subprocess
import sys

# Define your required packages here
REQUIRED_PACKAGES = [
    "tensorflow",
    "flask",
    "flask-cors",
    "flask-sqlalchemy",
    "numpy",
    "ultralytics",
    "dotenv"
]

VENV_NAME = ".venv"

def run_command(command):
    """Runs a system command and checks for errors."""
    result = subprocess.run(command, shell=True, text=True, capture_output=True)
    if result.returncode != 0:
        print(f"Error running command: {command}")
        print(result.stderr)
        sys.exit(1)
    print(result.stdout)

def delete_old_env():
    """Deletes the old virtual environment if it exists."""
    if os.path.exists(VENV_NAME):
        print(f"Deleting old environment '{VENV_NAME}'...")
        if sys.platform.startswith("win"):
            run_command(f"rmdir /s /q {VENV_NAME}")
        else:
            run_command(f"rm -rf {VENV_NAME}")

def create_new_env():
    """Creates a new virtual environment."""
    print(f"Creating new virtual environment '{VENV_NAME}'...")
    run_command(f"python -m venv {VENV_NAME}")

def activate_env():
    """Returns the activation command based on OS."""
    if sys.platform.startswith("win"):
        return f"{VENV_NAME}\\Scripts\\activate"
    return f"source {VENV_NAME}/bin/activate"

def install_packages():
    """Installs only the required packages."""
    print("Upgrading pip, setuptools, and wheel...")
    run_command(f"{activate_env()} && python -m pip install --upgrade pip setuptools wheel")

    for package in REQUIRED_PACKAGES:
        print(f"Installing {package}...")
        run_command(f"{activate_env()} && pip install {package}")

    print("Saving clean requirements.txt...")
    run_command(f"{activate_env()} && pip freeze > requirements.txt")

def main():
    delete_old_env()
    create_new_env()
    install_packages()
    print("\n✅ Clean environment setup complete! Use the following command to activate:")
    print(f"\n  {activate_env()}\n")

if __name__ == "__main__":
    main()
