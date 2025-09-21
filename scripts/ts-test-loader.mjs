import { readFile, access, stat } from 'node:fs/promises';
import { fileURLToPath, pathToFileURL } from 'node:url';
import path from 'node:path';
import ts from 'typescript';

const TS_EXTENSIONS = new Set(['.ts', '.tsx']);

const transpile = (source, filePath) => {
  const { outputText } = ts.transpileModule(source, {
    compilerOptions: {
      module: ts.ModuleKind.ESNext,
      moduleResolution: ts.ModuleResolutionKind.NodeNext,
      target: ts.ScriptTarget.ES2020,
      jsx: ts.JsxEmit.ReactJSX,
      esModuleInterop: true,
      allowSyntheticDefaultImports: true,
    },
    fileName: filePath,
  });
  return outputText;
};

export async function resolve(specifier, context, defaultResolve) {
  if (specifier.startsWith('node:') || specifier.startsWith('data:')) {
    return defaultResolve(specifier, context, defaultResolve);
  }

  const parentPath = context.parentURL ? fileURLToPath(context.parentURL) : process.cwd();
  const resolvedPath = path.resolve(path.dirname(parentPath), specifier);

  for (const ext of ['', '.ts', '.tsx', '.js']) {
    const candidate = ext ? `${resolvedPath}${ext}` : resolvedPath;
    try {
      await access(candidate);
      const url = pathToFileURL(candidate).href;
      return { url, shortCircuit: true };
    } catch {
      continue;
    }
  }

  try {
    const candidateDir = await stat(resolvedPath);
    if (candidateDir.isDirectory()) {
      for (const ext of ['.ts', '.tsx', '.js']) {
        const indexCandidate = path.join(resolvedPath, `index${ext}`);
        try {
          await access(indexCandidate);
          const url = pathToFileURL(indexCandidate).href;
          return { url, shortCircuit: true };
        } catch {
          continue;
        }
      }
    }
  } catch {
    // ignore
  }

  return defaultResolve(specifier, context, defaultResolve);
}

export async function load(url, context, defaultLoad) {
  if (!url.startsWith('file:')) {
    return defaultLoad(url, context, defaultLoad);
  }

  const extension = path.extname(fileURLToPath(url));
  if (TS_EXTENSIONS.has(extension)) {
    const source = await readFile(new URL(url));
    const code = transpile(source.toString(), fileURLToPath(url));
    return {
      format: 'module',
      source: code,
      shortCircuit: true,
    };
  }

  return defaultLoad(url, context, defaultLoad);
}
