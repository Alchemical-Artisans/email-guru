import { join } from "path";


export class Path {
  path: string;
  constructor(path: string) {
    this.path = path;
  }

  get base_folder(): Path {
    return new Path(this.separate_folder_name()[0]);
  }

  get below_base_folder(): Path {
    return new Path(this.separate_folder_name()[1]);
  }

  private separate_folder_name(): [string, string] {
    const [base, ...rest] = this.path.split("/") as [string, string];
    return [base, join(...rest)]
  }

  has_folder() {
    return this.path.includes("/");
  }

  join(rest: Path | string) {
    return new Path(join(this.path, typeof rest === "string" ? rest : rest.path));
  }
}
