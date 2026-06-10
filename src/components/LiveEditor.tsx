import { Sandpack } from "@codesandbox/sandpack-react";

export default function LiveEditor() {
  const code = `package main

import "fmt"

func validateDisk(path string) error {
	// TODO: Implement boundary check so agents cannot access /
	// Fix the code so it returns an error if path is "/"
	return nil
}

func main() {
	err := validateDisk("/")
	if err != nil {
		fmt.Println("PASS: Boundary check works!")
	} else {
		fmt.Println("FAIL: Agent escaped sandbox!")
	}
}
`;

  return (
    <div className="w-full max-w-4xl mx-auto my-12 rounded-lg overflow-hidden border border-[#262626] shadow-[0_0_20px_rgba(0,229,153,0.1)]">
      <Sandpack
        template="vanilla"
        theme="dark"
        customSetup={{
          dependencies: {},
        }}
        files={{
          "/main.go": code,
        }}
        options={{
          showConsoleButton: true,
          showConsole: true,
          editorHeight: 400,
          wrapContent: true,
        }}
      />
    </div>
  );
}