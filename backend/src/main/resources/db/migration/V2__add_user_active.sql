-- V2: baja lógica de usuarios.
-- Columna active con DEFAULT TRUE: las filas existentes quedan activas.
ALTER TABLE users ADD COLUMN active BOOLEAN NOT NULL DEFAULT TRUE;
