
CREATE TABLE user (
    id TEXT PRIMARY KEY,
    username TEXT UNIQUE NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

---breakpoint

CREATE TABLE todo (
    id TEXT PRIMARY KEY,
    user_id TEXT REFERENCES user(id) NOT NULL,
    title TEXT NOT NULL,
    emoji TEXT NOT NULL,
    description TEXT,
    done INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
