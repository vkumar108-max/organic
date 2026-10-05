-- AuditLog is append-only: block UPDATE and DELETE at the database level.
-- (ON DELETE SET NULL on actorId is performed by the FK action which is an UPDATE; we allow
-- only that specific change: actorId -> NULL with every other column unchanged.)
CREATE OR REPLACE FUNCTION prevent_audit_log_mutation() RETURNS trigger AS $$
BEGIN
  IF TG_OP = 'UPDATE'
     AND NEW."actorId" IS NULL
     AND OLD."actorId" IS NOT NULL
     AND NEW."id" = OLD."id"
     AND NEW."action" = OLD."action"
     AND NEW."description" = OLD."description"
     AND NEW."createdAt" = OLD."createdAt"
     AND NEW."actorEmail" IS NOT DISTINCT FROM OLD."actorEmail"
     AND NEW."metadata"::text IS NOT DISTINCT FROM OLD."metadata"::text THEN
    RETURN NEW;
  END IF;
  RAISE EXCEPTION 'AuditLog is append-only (% blocked)', TG_OP;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER audit_log_no_update
  BEFORE UPDATE ON "AuditLog"
  FOR EACH ROW EXECUTE FUNCTION prevent_audit_log_mutation();

CREATE TRIGGER audit_log_no_delete
  BEFORE DELETE ON "AuditLog"
  FOR EACH ROW EXECUTE FUNCTION prevent_audit_log_mutation();
