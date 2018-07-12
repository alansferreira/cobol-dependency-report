const srcPath = '/home/alansferreira/dev/repo/local-tests/cobol-wrk-test';
const parsers = require('cobol-parsers');
const fs = require('fs');
const glob = require('glob');
const path = require('path');

// const nedb = require('nedb');
// const cobRawDeps = new nedb({filename: './cob-raw-dependencies.nedb', autoload: true});
// cobRawDeps.ensureIndex({fieldName: 'name'}, ()=>{});

glob(srcPath + '/**/*.{cob,cpy}', function (er, files) {

    const depTreeRoot = {};
    const refRoot = {};

    files.map((f) => {
        
        const parsedFile = path.parse(f);
        depItem = {
            collapsed: true,
            address: {
                fileName: f
            },
            name: parsedFile.name,
            title: parsedFile.name,
            references: [],
            dependencies: []
        };

        depTreeRoot[depItem.name] = depItem;

        refRoot[parsedFile.name] = {
            name: parsedFile.name,
            referencedBy: []
        };

    });


    let statements = [];
    let stmtGroups = {};
    const pushRecursive = (o)=> {
        statements.push(...o.statements);
        if(o.divisions) o.divisions.map(pushRecursive);
        if(o.sections) o.sections.map(pushRecursive);
    };

    for (const name in depTreeRoot) {
        if (!depTreeRoot.hasOwnProperty(name)) continue;
        const depItem = depTreeRoot[name];

        let srcContent = new String(fs.readFileSync(depItem.address.fileName));
        let program = parsers.program.parseProgram(srcContent);
        let references = parsers.program.extractReferences(program);

        // const refs = [];
    
        (references.program || []).map((r) => {
            if(!depTreeRoot[r.reference.programName]){
                depTreeRoot[r.reference.programName] = {
                    collapsed: true,
                    fileName: null,
                    name: r.reference.programName,
                    title: r.reference.programName,
                    references: [],
                    dependencies: []
                };
                refRoot[r.reference.programName] = {
                    name: r.reference.programName,
                    referencedBy: []
                };
            }
            depItem.dependencies.push({
                ...depTreeRoot[r.reference.programName],
                ...{startedAtLine: r.startedAtLine}
            });
            refRoot[r.reference.programName].referencedBy.push({
                name: name,
                ...{startedAtLine: r.startedAtLine}
            });
        });
        
        
        (references.copybook || []).map((r) => {
            if(!depTreeRoot[r.reference.fileName]){
                depTreeRoot[r.reference.fileName] = {
                    collapsed: true,
                    fileName: null,
                    name: r.reference.fileName,
                    title: r.reference.fileName,
                    references: [],
                    dependencies: []
                };
                refRoot[r.reference.fileName] = {
                    name: r.reference.fileName,
                    referencedBy: []
                };
        
            }
            depItem.dependencies.push({
                ...depTreeRoot[r.reference.fileName],
                ...{startedAtLine: r.startedAtLine}
            });
            refRoot[r.reference.fileName].referencedBy.push({
                name: name,
                ...{startedAtLine: r.startedAtLine}
            });

        });

        (references.cics || []).map((r) => {
            if(!depTreeRoot[r.reference.programName]){
                depTreeRoot[r.reference.programName] = {
                    collapsed: true,
                    fileName: null,
                    name: r.reference.programName,
                    title: r.reference.programName,
                    references: [],
                    dependencies: []
                };
                refRoot[r.reference.programName] = {
                    name: r.reference.programName,
                    referencedBy: []
                };
        
            }
            depItem.dependencies.push({
                ...depTreeRoot[r.reference.programName],
                ...{startedAtLine: r.startedAtLine}
            });
            refRoot[r.reference.programName].referencedBy.push({
                name: name,
                ...{startedAtLine: r.startedAtLine}
            });

        });

        // (references.program || []).map((r) => console.log(`${path.basename(f)}: ${r.type}(${r.reference.programName});`));
        // (references.copybook || []).map((r) => console.log(`${path.basename(f)}: ${r.type}(${r.reference.fileName});`));
        // (references.cics || []).map((r) => console.log(`${path.basename(f)}: ${r.type}(${r.reference.programName});`));
        // (references.query || []).map((r) => console.log(`${path.basename(f)}: ${r.type}(${r.reference.query});`));   
    
        
        program = null;        
        srcContent = null;
        references = null;
        
    }

    const output = {
        fileName: srcPath,
        name: path.basename(srcPath),
        title: path.basename(srcPath),
        references: [],
        dependencies: []

    }

    const names = [];
    for (const name in depTreeRoot) {
        if (!depTreeRoot.hasOwnProperty(name)) continue;
        if(!depTreeRoot[name].dependencies || !depTreeRoot[name].dependencies.length) continue;
        fs.writeFileSync(`./deps/root-dep-${name.replace(/\'/g, '')}.json`, JSON.stringify(depTreeRoot[name], undefined, 2));
        names.push(name);
        output.dependencies.push(depTreeRoot[name]);
    }

    fs.writeFileSync(`./deps/root-dep.json`, JSON.stringify(output, undefined, 2));
    fs.writeFileSync(`./deps/root-ref.json`, JSON.stringify(refRoot, undefined, 2));


    // REFERENCED By...
    
    // for (const name in depTreeRoot) {
    //     if (!depTreeRoot.hasOwnProperty(name)) continue;
    //     if(!depTreeRoot[name].dependencies || !depTreeRoot[name].dependencies.length) continue;
    //     fs.writeFileSync(`./deps/root-dep-${name.replace(/\'/g, '')}.json`, JSON.stringify(depTreeRoot[name], undefined, 2));
    //     names.push(name);
    //     output.dependencies.push(depTreeRoot[name]);
    // }


});

