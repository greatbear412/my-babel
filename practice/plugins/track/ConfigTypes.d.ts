interface Config {
    [key: string]: ConfigItem
}

interface ConfigItem {
    importFn?: string,
    path?: string,
    expression: string,
    position?: 'top' | 'bottom',
    class?: string,
    file?: string
}
