import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { Header } from "../Header";

vi.mock("~/utils", () => {
  return {
    useOptionalUser: () => undefined,
  };
});

test("Header renders correctly", () => {
  render(
    <MemoryRouter>
      <Header />
    </MemoryRouter>
  );

  expect(screen.getByText("dough.")).toBeInTheDocument();
});
