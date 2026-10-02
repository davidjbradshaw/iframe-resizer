import createDeprecate from './deprecate'

describe('deprecate', () => {
  let mockAdvise
  let deprecate

  beforeEach(() => {
    mockAdvise = vi.fn() // Mock the advise function
    deprecate = createDeprecate(mockAdvise) // Create the deprecate function
  })

  test('should call advise with the correct message for a deprecated method', () => {
    const deprecateMethod = deprecate('Method')
    deprecateMethod(
      'oldMethod()',
      'newMethod()',
      'Additional info. ',
      'iframe1',
    )

    expect(mockAdvise).toHaveBeenCalledWith(
      'iframe1',
      `<rb>Deprecated Method(oldMethod)</>\n\nThe <b>oldMethod()</> method has been renamed to <b>newMethod()</>. Additional info. Use of the old method will be removed in a future version of <i>iframe-resizer</>.`,
    )
  })

  test('should call advise with the correct message for a deprecated option', () => {
    const deprecateOption = deprecate('Option', 'replaced by')
    deprecateOption('oldOption', 'newOption', '', 'iframe2')

    expect(mockAdvise).toHaveBeenCalledWith(
      'iframe2',
      `<rb>Deprecated Option(oldOption)</>\n\nThe <b>oldOption</> option has been replaced by <b>newOption</>. Use of the old option will be removed in a future version of <i>iframe-resizer</>.`,
    )
  })

  test('should handle cases where no additional info is provided', () => {
    const deprecateMethod = deprecate('Method')
    deprecateMethod('oldMethod()', 'newMethod()')

    expect(mockAdvise).toHaveBeenCalledWith(
      '',
      `<rb>Deprecated Method(oldMethod)</>\n\nThe <b>oldMethod()</> method has been renamed to <b>newMethod()</>. Use of the old method will be removed in a future version of <i>iframe-resizer</>.`,
    )
  })
})
