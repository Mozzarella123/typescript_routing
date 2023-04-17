import { expectTypeOf } from "expect-type";
import { ExtractParam, ExtractParams } from "./navigation";
import { it } from "vitest";

it('ExtractParam type ', () => {
  expectTypeOf({ taskId: '' }).toMatchTypeOf<ExtractParam<':taskId'>>();
  // @ts-expect-error
  expectTypeOf({ tassId: '' }).toMatchTypeOf<ExtractParam<':taskId'>>();
});

it('ExtractParams', () => {
  expectTypeOf({ taskId: '' }).toMatchTypeOf<ExtractParams<'/:taskId'>>();
  expectTypeOf({ }).toEqualTypeOf<ExtractParams<'/path/without/params'>>();
  // @ts-expect-error
  expectTypeOf({ tassId: '' }).toMatchTypeOf<ExtractParams<'/:taskId'>>();
})
