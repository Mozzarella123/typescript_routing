import { RouteObject } from "react-router-dom";
import { ReadonlyDeep } from "type-fest";

type PathObj<Path extends string, CurrentPath extends string> = {
  path: CurrentPath;
  fullPath: Path;
}

type MergeArrayOfObjects<T, Path extends string = ''> =
  T extends readonly [infer R, ...infer Rest]
    ? RecursiveValues<R, Path> & MergeArrayOfObjects<Rest, Path>
    : unknown;

type ReplaceTrailingSlash<T extends string> = T extends `//${infer R}` ? `/${R}` : T;

export type GetPath<Path extends string, CurrentPath extends string> = ReplaceTrailingSlash<`${Path}/${CurrentPath}`>;

type RecursiveValues<T, Path extends string = ''> = T extends {
    id: infer Name extends string;
    path: infer CurrentPath extends string;
  }
  ? {
    [Prop in Name as Name]:
    T extends { children: infer Children}
      ? MergeArrayOfObjects<
      Children,
      GetPath<Path, CurrentPath>
    > & PathObj<GetPath<Path, CurrentPath>, CurrentPath>
      : PathObj<GetPath<Path, CurrentPath>, CurrentPath>
  }
  : object

export type ExtractParam<Path, NextPart = {}> = Path extends `:${infer Param}`
  ? Record<Param, string> & NextPart
  : NextPart;

export type ExtractParams<Path> = Path extends `${infer Segment}/${infer Rest}`
  ? ExtractParam<Segment, ExtractParams<Rest>>
  : ExtractParam<Path>

const ROUTES_CONFIG = {
  id: 'root',
  path: '',
  children: [{
    path: 'tasks',
    id: 'tasks',
    children: [
      { path: ':taskId',  id: 'task' }
    ]
  }]
} as const satisfies ReadonlyDeep<RouteObject>;

export const transformRoutes = <T extends ReadonlyDeep<RouteObject>>(routes: T) => {
  // @ts-ignore
  const traverse = (current: IRoute, fullPath: string = current.path) => {
    const { path, children, name } = current;
    if (children == null) {
      return { [name]: {
          path,
          fullPath
        } };
    }

    return {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-return
      [name]: children.map((route) => traverse(route, `${fullPath}/${route.path}`)).reduce((previousValue, currentValue) => ({
        ...previousValue,
        ...currentValue
      }),{
        path,
        fullPath
      }),
    };
  };
  return traverse(routes) as RecursiveValues<T>;
};

export const ROUTES = transformRoutes(ROUTES_CONFIG);
