import {
  render,
  screen,
  //   waitForElementToBeRemoved,
} from "@testing-library/react";
import { Async } from ".";

test("it renders correctly", async () => {
  render(<Async />);

  expect(screen.getByText("Hello World")).toBeInTheDocument();

  //   testa elemento que aparece depois de um tempo na tela
  expect(
    await screen.findByText("Button", {}, { timeout: 2000 })
  ).toBeInTheDocument();
  //   ou;

  //   await waitFor(
  //     () => {
  //       return expect(screen.getByText("Button")).toBeInTheDocument();
  //     },
  //     {
  //       timeout: 2000,
  //     }
  //   );

  //   testa elemento que some depois de um tempo na tela

  //   await waitForElementToBeRemoved(screen.queryByText("Button"));
});
