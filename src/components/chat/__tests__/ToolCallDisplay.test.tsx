import { test, expect, afterEach } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";
import { ToolCallDisplay } from "../ToolCallDisplay";

afterEach(() => {
  cleanup();
});

// str_replace_editor

test("shows 'Creating' label for str_replace_editor create command", () => {
  render(
    <ToolCallDisplay
      tool={{
        toolName: "str_replace_editor",
        state: "call",
        args: { command: "create", path: "src/components/Button.jsx" },
      }}
    />
  );
  expect(screen.getByText("Creating Button.jsx")).toBeDefined();
});

test("shows 'Editing' label for str_replace command", () => {
  render(
    <ToolCallDisplay
      tool={{
        toolName: "str_replace_editor",
        state: "call",
        args: { command: "str_replace", path: "src/App.jsx" },
      }}
    />
  );
  expect(screen.getByText("Editing App.jsx")).toBeDefined();
});

test("shows 'Inserting into' label for insert command", () => {
  render(
    <ToolCallDisplay
      tool={{
        toolName: "str_replace_editor",
        state: "call",
        args: { command: "insert", path: "src/App.jsx" },
      }}
    />
  );
  expect(screen.getByText("Inserting into App.jsx")).toBeDefined();
});

test("shows 'Reading' label for view command", () => {
  render(
    <ToolCallDisplay
      tool={{
        toolName: "str_replace_editor",
        state: "call",
        args: { command: "view", path: "src/utils/helpers.js" },
      }}
    />
  );
  expect(screen.getByText("Reading helpers.js")).toBeDefined();
});

// file_manager

test("shows rename label with old and new filename", () => {
  render(
    <ToolCallDisplay
      tool={{
        toolName: "file_manager",
        state: "call",
        args: { command: "rename", path: "src/Old.jsx", new_path: "src/New.jsx" },
      }}
    />
  );
  expect(screen.getByText("Renaming Old.jsx → New.jsx")).toBeDefined();
});

test("shows delete label for file_manager delete command", () => {
  render(
    <ToolCallDisplay
      tool={{
        toolName: "file_manager",
        state: "call",
        args: { command: "delete", path: "src/Unused.jsx" },
      }}
    />
  );
  expect(screen.getByText("Deleting Unused.jsx")).toBeDefined();
});

// State: in-progress vs done

test("shows spinner while in progress", () => {
  const { container } = render(
    <ToolCallDisplay
      tool={{
        toolName: "str_replace_editor",
        state: "call",
        args: { command: "create", path: "App.jsx" },
      }}
    />
  );
  expect(container.querySelector(".animate-spin")).toBeTruthy();
});

test("shows check icon when done", () => {
  const { container } = render(
    <ToolCallDisplay
      tool={{
        toolName: "str_replace_editor",
        state: "result",
        args: { command: "create", path: "App.jsx" },
        result: "OK",
      }}
    />
  );
  expect(container.querySelector(".animate-spin")).toBeNull();
  // CheckCircle2 renders an svg; confirm spinner is gone and label still shows
  expect(screen.getByText("Creating App.jsx")).toBeDefined();
});

// Extracts filename from nested path

test("displays only the filename, not the full path", () => {
  render(
    <ToolCallDisplay
      tool={{
        toolName: "str_replace_editor",
        state: "call",
        args: { command: "str_replace", path: "src/components/forms/LoginForm.jsx" },
      }}
    />
  );
  expect(screen.getByText("Editing LoginForm.jsx")).toBeDefined();
  expect(screen.queryByText(/src\/components/)).toBeNull();
});
