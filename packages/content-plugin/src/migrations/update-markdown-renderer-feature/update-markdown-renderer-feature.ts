/* eslint-disable @typescript-eslint/no-unused-vars */
import {
  addDependenciesToPackageJson,
  formatFiles,
  installPackagesTask,
  Tree,
  visitNotIgnoredFiles,
} from '@nx/devkit';
import { CallExpression, Node, Project } from 'ts-morph';

export default async function update(host: Tree) {
  let project: Project;

  visitNotIgnoredFiles(host, '/', (file) => {
    if (file.endsWith('.ts')) {
      const content = host.read(file, 'utf-8');
      if (
        content &&
        content.includes('withMarkdownRenderer') &&
        !content.includes('withPrismHighlighter') &&
        !content.includes('withShikiHighlighter')
      ) {
        if (!project) {
          project = new Project({
            useInMemoryFileSystem: true,
            skipAddingFilesFromTsConfig: true,
          });
        }

        const sourceFile = project.createSourceFile(file, content);

        const provideContentNode = sourceFile.getFirstDescendant(
          (node): node is CallExpression =>
            Node.isCallExpression(node) &&
            node.getText().includes('provideContent') &&
            node.getText().includes('withMarkdownRenderer'),
        );

        if (provideContentNode) {
          sourceFile.addImportDeclaration({
            moduleSpecifier: '@analogjs/content/prism-highlighter',
            namedImports: ['withPrismHighlighter'],
          });

          provideContentNode.addArgument('withPrismHighlighter()');
        }

        host.write(file, sourceFile.getFullText());
      }
    }
  });

  // NOTE: we only add the dependency if the project is an Angular project
  //  Nx projects can add the dependency from migrations.json
  let dependencyAdded = false;
  if (host.exists('/angular.json')) {
    addDependenciesToPackageJson(host, { 'marked-mangle': '^1.1.7' }, {});
    dependencyAdded = true;
  }

  await formatFiles(host);

  if (dependencyAdded) {
    return () => installPackagesTask(host);
  }
}
