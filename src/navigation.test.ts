import { expectTypeOf } from "expect-type";
import { extractParam, ExtractParam, extractParams, ExtractParams } from "./navigation";
import { expect, it } from "vitest";

it('ExtractParam type ', () => {
  expectTypeOf({ taskId: '' }).toMatchTypeOf<ExtractParam<':taskId'>>();
  // @ts-expect-error
  expectTypeOf({ tassId: '' }).toMatchTypeOf<ExtractParam<':taskId'>>();
});

it('extractParam func', function () {
  expect(extractParam(':taskId')).toEqual({ taskId: '' });
  expect(extractParam('taskId')).toEqual({ });
});

it('ExtractParams', () => {
  expectTypeOf({ taskId: '' }).toMatchTypeOf<ExtractParams<'/:taskId'>>();
  expectTypeOf({ taskId: '', tab: '' }).toMatchTypeOf<ExtractParams<'/tasks/:taskId/:tab'>>();
  expectTypeOf({ }).toEqualTypeOf<ExtractParams<'/path/without/params'>>();
  // @ts-expect-error
  expectTypeOf({ tassId: '' }).toMatchTypeOf<ExtractParams<'/:taskId'>>();
})

it('extractParams func', function () {
  expect(extractParams('/:taskId')).toEqual({ taskId: '' });
  expect(extractParams('/tasks/:taskId/:tab')).toEqual({ taskId: '', tab: '' });
  expect(extractParams('/path/without/params')).toEqual({ });
});
