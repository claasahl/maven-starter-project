import "bootstrap/dist/css/bootstrap.min.css";
import * as React from "react";
import "./App.css";

import Select from "react-select";
import makeAnimated from "react-select/lib/animated";
import { options } from "./data";
import { IDigestable } from "./Digestable";

import { saveAs } from "file-saver";
import * as JSZip from "jszip";

import { library } from "@fortawesome/fontawesome-svg-core";
import { faCookie, faCookieBite } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import SelectedDigestables from "./SelectedDigestables";

library.add(faCookie, faCookieBite);

interface IState {
  selectedOptions: IDigestable[];
}

class App extends React.Component<any, IState> {
  constructor(props: any) {
    super(props);
    this.state = {
      selectedOptions: []
    };
    this.save = this.save.bind(this);
    this.onChange = this.onChange.bind(this);
  }

  public render() {
    const { selectedOptions } = this.state;
    return (
      <div className="App">
        <header className="App-header">
          <FontAwesomeIcon className="App-logo" size="5x" icon="cookie-bite" />
          <h1 className="App-title">Combine Digestable Examples</h1>
        </header>
        <SelectedDigestables selected={selectedOptions} />
        <div className="container">
          <Select<IDigestable>
            isMulti={true}
            options={options}
            components={makeAnimated()}
            onChange={this.onChange}
            getOptionLabel={this.getOptionLabel}
            getOptionValue={this.getOptionValue}
          />
          <button
            type="button"
            className="btn btn-primary btn-lg"
            onClick={this.save}
            disabled={selectedOptions.length === 0}
          >
            Save
          </button>
        </div>
      </div>
    );
  }

  private async fetch(option: IDigestable, file: string): Promise<string> {
    const url = new URL("./" + file, option.baseURL);
    const response = await fetch(url.toString());
    return response.text();
  }

  private async save() {
    const { selectedOptions } = this.state;
    const zip = new JSZip();
    for (const option of selectedOptions) {
      zip.file(`${option.name}/option.json`, JSON.stringify(option));
      for (const file of option.files) {
        const content = await this.fetch(option, file);
        zip.file(`${option.name}/${file}`, content, { binary: true });
      }
    }

    const blob = await zip.generateAsync({ type: "blob" });
    saveAs(blob, "hello.zip");
  }

  private onChange(selectedOptions: IDigestable[]) {
    this.setState(() => ({
      selectedOptions
    }));
  }
  private getOptionLabel(option: IDigestable): string {
    return option.name;
  }
  private getOptionValue(option: IDigestable): string {
    return option.name;
  }
}

export default App;
