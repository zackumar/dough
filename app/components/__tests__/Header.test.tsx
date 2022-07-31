import { render, screen } from "@testing-library/react";
import { userInfo } from "os";
import { Header } from "../Header";

test("Header renders correctly", () => {
  render(<Header />);

  expect(screen.getByText("dough.")).toBeInTheDocument();
});
