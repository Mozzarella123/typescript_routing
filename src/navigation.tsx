import { RouteObject } from "react-router-dom";
import { ReadonlyDeep } from "type-fest";
import Tasks from "./Tasks";
import App from "./App";

type ConstantRoute<
  FullPath extends string,
  Path extends string
> = Omit<RouteObject, 'path'> & {
  path: Path;
  fullPath: FullPath;
}

export const constantRoute = (path: string, fullPath: string): {
  path: string;
  fullPath: string;
} => ({
  path,
  fullPath,
})

type MergeArrayOfObjects<T, Path extends string = ''> =
  T extends readonly [infer R, ...infer Rest]
    ? RecursiveTransform<R, Path> & MergeArrayOfObjects<Rest, Path>
    : unknown;

export function mergeArrayOfObjects(arr: RouteObject[], path = '') {
  const [first, ...rest] = arr;
  if (first) {
    return {
      ...recursiveTransform(first, path),
      ...mergeArrayOfObjects(rest, path),
    }
  }
  return {};
}

type ReplaceTrailingSlash<T extends string> = T extends `//${infer R}` ? `/${R}` : T;

export type ConcatPath<FullPath extends string, Path extends string> = ReplaceTrailingSlash<`${FullPath}/${Path}`>;

const replaceTrailingSlash = (path: string) => path.replace(/\/\//g, '/');

function concatPath(path: string, currentPath: string) {
  return replaceTrailingSlash(`${path}/${currentPath}`);
}

type RecursiveTransform<
  RouteObject,
  FullPath extends string = ''
> = RouteObject extends {
  id: infer Name extends string;
  path: infer Path extends string;
} ? TransformIdToProperty<Name, RouteObject, Path, FullPath>
  : { }

type TransformIdToProperty<
  ID extends string,
  RouteObject,
  Path extends string,
  FullPath extends string,
  ConcatedPath extends string = ConcatPath<FullPath, Path>
> = {
  [Prop in ID]: RouteObject extends { children: infer Children }
    ? MergeArrayOfObjects<
    Children,
    ConcatedPath> & ConstantRoute<ConcatedPath, Path>
    : ConstantRoute<ConcatedPath, Path>
}

export function recursiveTransform(obj: RouteObject, fullPath = '') {
  const {
    id,
    path,
    children
  } = obj;
  if (id && path) {
    const concatedPath = concatPath(fullPath, path);

    if (children) {

      return {
        [id]: {
          ...mergeArrayOfObjects(children, concatedPath),
          ...constantRoute(path, concatedPath),
        }
      }
    }
    return {
      [id]: constantRoute(path, concatedPath),
    }
  }
  return {};
}

export type ExtractParam<Path> = Path extends `:${infer Param}`
  ? Record<Param, string>
  : { };

export const extractParam = (path: any) => {
  if (typeof path === "string" && path.startsWith(':')) {
    const param = path.slice(1);

    return {
      [param]: '',
    }
  }
  else {
    return {}
  }
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
  return traverse(routes) as RecursiveTransform<T>;
};

export const ROUTES = transformRoutes(ROUTES_CONFIG);
