import { RouteObject } from "react-router-dom";
import { ReadonlyDeep } from "type-fest";
import Tasks from "./Tasks";
import App from "./App";

type PathObj<Path extends string, CurrentPath extends string> = {
  path: CurrentPath;
  fullPath: Path;
}

export const pathObj = (path: string, fullPath: string): {
  path: string;
  fullPath: string;
} => ({
  path,
  fullPath,
})

type MergeArrayOfObjects<T, Path extends string = ''> =
  T extends readonly [infer R, ...infer Rest]
    ? RecursiveValues<R, Path> & MergeArrayOfObjects<Rest, Path>
    : unknown;

function mergeArrayOfObjects(arr: any[], path = '') {
  const [first, ...rest] = arr;
  if (first) {
    return {
      ...recursiveValues(first, path),
      ...mergeArrayOfObjects(rest, path),
    }
  }
  return {};
}

type ReplaceTrailingSlash<T extends string> = T extends `//${infer R}` ? `/${R}` : T;

export type GetPath<Path extends string, CurrentPath extends string> = ReplaceTrailingSlash<`${Path}/${CurrentPath}`>;

function getPath(path: string, currentPath: string) {
  return `${path}/${currentPath}`.replace(/\/\//g, '/');
}

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

function recursiveValues(obj: any, path = '') {
  const { id, path: currentPath, children } = obj;
  if (id && currentPath) {
    if (children) {
      return {
        [id]: {
          ...mergeArrayOfObjects(children, getPath(path, currentPath)),
          ...pathObj(path, currentPath),
        }
      }
    }
    return {
      [id]: pathObj(path, currentPath),
    }
  }
  return {};
}

export type ExtractParam<Path> = Path extends `:${infer Param}`
  ? Record<Param, string>
  : { };

export const extractParam = (path: string) => {
  if (path.startsWith(':')) {
    return {
      [path.slice(1)]: '',
    }
  }
  return {}
}

export type ExtractParams<Path> = Path extends `${infer Segment}/${infer Rest}`
  ? ExtractParam<Segment> & ExtractParams<Rest>
  : ExtractParam<Path>

export const extractParams = (path: string): Record<string, string> => {
  const firstSlash = path.indexOf('/');
  if (firstSlash === -1) {
    return extractParam(path);
  }
  const [segment, rest] = [path.slice(0, firstSlash), path.slice(firstSlash + 1)];
  return {
    ...extractParam(segment),
    ...extractParams(rest)
  }
}

export const ROUTES_CONFIG = {
  id: 'root',
  path: '',
  element: <App/>,
  children: [{
    path: 'tasks',
    id: 'tasks',
    element: <Tasks />,
    children: [
      { path: ':taskId',  id: 'task' }
    ]
  }]
} as const satisfies ReadonlyDeep<RouteObject>;

export const transformRoutes = <T extends ReadonlyDeep<RouteObject>>(routes: T) => {
  // @ts-ignore
  const traverse = (current: IRoute, fullPath: string = current.path) => {
    const { path, children, id } = current;
    if (children == null) {
      return { [id]: {
          id,
          path,
          fullPath
        } };
    }

    return {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-return
      [id]: children.map((route) => traverse(
        route,
        `${fullPath}/${route.path}`))
        .reduce((previousValue, currentValue) => ({
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
