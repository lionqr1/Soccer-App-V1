-- Add a constraint to prevent deletion of admin accounts
-- This creates a function that will be triggered before any delete operation
CREATE OR REPLACE FUNCTION prevent_admin_deletion()
RETURNS TRIGGER AS $$
BEGIN
  IF OLD.role = 'admin' THEN
    RAISE EXCEPTION 'Admin accounts cannot be deleted for security reasons.';
  END IF;
  RETURN OLD;
END;
$$ LANGUAGE plpgsql;

-- Create the trigger
DROP TRIGGER IF EXISTS prevent_admin_deletion_trigger ON players;
CREATE TRIGGER prevent_admin_deletion_trigger
  BEFORE DELETE ON players
  FOR EACH ROW
  EXECUTE FUNCTION prevent_admin_deletion();

-- Also prevent role changes from admin to non-admin for existing admins
CREATE OR REPLACE FUNCTION prevent_admin_role_change()
RETURNS TRIGGER AS $$
BEGIN
  IF OLD.role = 'admin' AND NEW.role != 'admin' THEN
    RAISE EXCEPTION 'Admin role cannot be changed for security reasons.';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create the trigger for role changes
DROP TRIGGER IF EXISTS prevent_admin_role_change_trigger ON players;
CREATE TRIGGER prevent_admin_role_change_trigger
  BEFORE UPDATE ON players
  FOR EACH ROW
  EXECUTE FUNCTION prevent_admin_role_change();
