/** @type {Array<[string, number]>} */
const documentsData = [
  ['acrostic-talk.pdf', 100],
  ['argumentation-cross-domain-talk.pdf', 9],
  ['cicling14-talk.pdf', 14],
  ['cikm13-talk.pdf', 19],
  ['eurovis15-plagvis-talk.pdf', 63],
  ['ijcnlp13-talk.pdf', 13],
  ['jufo13-talk.pdf', 22],
  ['leipzig-colloquium15-talk.pdf', 118],
  ['netspeak-talk.pdf', 45],
  ['ral15-picapica-talk.pdf', 82],
  ['republica17-clickbait-talk.pdf', 14],
  ['ukj16-picapica-talk.pdf', 46],
  ['webquality12-talk.pdf', 41],
  ['potthast_2011b.pdf', 61],
  ['potthast_2012a.pdf', 28],
  ['potthast_2016c.pdf', 88],
  ['stein_2005b.pdf', 24],
  ['stein_2006j.pdf', 33],
  ['stein_2006l.pdf', 20],
  ['stein_2007b.pdf', 43],
  ['stein_2007d.pdf', 21],
  ['stein_2007m.pdf', 24],
  ['stein_2008b.pdf', 7],
  ['stein_2008d.pdf', 20],
  ['stein_2008j.pdf', 64],
  ['stein_2009e.pdf', 31],
  ['stein_2010h.pdf', 55],
  ['stein_2010r.pdf', 10],
  ['stein_2010t.pdf', 27],
  ['stein_2010u.pdf', 25],
  ['stein_2011e.pdf', 39],
  ['stein_2011f.pdf', 20],
  ['stein_2011h.pdf', 36],
  ['stein_2011j.pdf', 51],
  ['stein_2011k.pdf', 76],
  ['stein_2011l.pdf', 64],
  ['stein_2011q.pdf', 30],
  ['stein_2011t.pdf', 24],
  ['stein_2011u.pdf', 16],
  ['stein_2012c.pdf', 34],
  ['stein_2012m.pdf', 13],
  ['stein_2012o.pdf', 34],
  ['stein_2012q.pdf', 46],
  ['stein_2012t.pdf', 26],
  ['stein_2012u.pdf', 24],
  ['stein_2012w.pdf', 20],
  ['stein_2013a.pdf', 15],
  ['stein_2013b.pdf', 47],
  ['stein_2013f.pdf', 52],
  ['stein_2013g.pdf', 17],
  ['stein_2013h.pdf', 29],
  ['stein_2014b.pdf', 14],
  ['stein_2014f.pdf', 24],
  ['stein_2014j.pdf', 31],
  ['stein_2014k.pdf', 27],
  ['stein_2015b.pdf', 35],
  ['stein_2015c.pdf', 47],
  ['stein_2015n.pdf', 13],
  ['stein_2015o.pdf', 48],
  ['stein_2016a.pdf', 36],
  ['stein_2016b.pdf', 2],
  ['stein_2016c.pdf', 34],
  ['stein_2016d.pdf', 49],
  ['stein_2016i.pdf', 11],
  ['stein_2016j.pdf', 26],
  ['stein_2016k.pdf', 44],
  ['stein_2016l.pdf', 31],
  ['stein_2016m.pdf', 67],
  ['stein_2016o.pdf', 63],
  ['stein_2017a.pdf', 17],
  ['stein_2017b.pdf', 10],
  ['stein_2017c.pdf', 11],
  ['unit-de-client-technologies1.pdf', 87],
  ['unit-de-client-technologies2.pdf', 45],
  ['unit-de-conceptual-design1.pdf', 31],
  ['unit-de-conceptual-design2.pdf', 52],
  // ["unit-de-conceptual-design3.pdf", 1],
  ['unit-de-configuration-basics.pdf', 34],
  ['unit-de-constraints-fd1.pdf', 43],
  ['unit-de-constraints-fd2.pdf', 50],
  ['unit-de-constraints-ifd.pdf', 18],
  ['unit-de-constraints-introduction.pdf', 34],
  ['unit-de-db-introduction.pdf', 50],
  ['unit-de-db-organization.pdf', 9],
  ['unit-de-design-and-models.pdf', 28],
  ['unit-de-diagnosis-bayes.pdf', 28],
  ['unit-de-diagnosis-cbr.pdf', 35],
  ['unit-de-diagnosis-dempster.pdf', 34],
  ['unit-de-doclang-css.pdf', 35],
  ['unit-de-doclang-html.pdf', 53],
  ['unit-de-doclang-introduction.pdf', 30],
  ['unit-de-doclang-xml-api.pdf', 77],
  ['unit-de-doclang-xml-basics.pdf', 74],
  ['unit-de-doclang-xml-schema.pdf', 92],
  ['unit-de-doclang-xml-xsl.pdf', 115],
  ['unit-de-ensemble-classifiers.pdf', 32],
  ['unit-de-fuzzy-basics.pdf', 44],
  ['unit-de-fuzzy-inference.pdf', 29],
  ['unit-de-index-terms.pdf', 20],
  ['unit-de-ir-evaluation.pdf', 19],
  ['unit-de-ir-introduction.pdf', 25],
  ['unit-de-ir-organization.pdf', 6],
  ['unit-de-kbs-applications.pdf', 31],
  ['unit-de-kbs-introduction.pdf', 28],
  ['unit-de-kbs-organization.pdf', 7],
  ['unit-de-logics-algebra.pdf', 3],
  ['unit-de-logics-organization.pdf', 5],
  ['unit-de-model-formation.pdf', 14],
  ['unit-de-model-system.pdf', 18],
  ['unit-de-network-protocol1.pdf', 44],
  ['unit-de-network-protocol2.pdf', 38],
  ['unit-de-network-protocol3.pdf', 53],
  ['unit-de-non-monotonicity.pdf', 21],
  ['unit-de-planning-algorithms.pdf', 56],
  ['unit-de-planning-basics.pdf', 40],
  ['unit-de-predicate-basics.pdf', 36],
  ['unit-de-predicate-complexity.pdf', 6],
  ['unit-de-predicate-sat-syntactical.pdf', 27],
  ['unit-de-predicate-transformation.pdf', 23],
  ['unit-de-propositional-basics.pdf', 58],
  ['unit-de-propositional-complexity.pdf', 18],
  ['unit-de-propositional-sat-semantical.pdf', 22],
  ['unit-de-propositional-sat-syntactical.pdf', 56],
  ['unit-de-propositional-transformation.pdf', 33],
  ['unit-de-psk.pdf', 12],
  ['unit-de-relational-algebra.pdf', 67],
  ['unit-de-relational-calculus.pdf', 85],
  // ["unit-de-relational-design0.pdf", 1],
  ['unit-de-relational-design1.pdf', 43],
  ['unit-de-relational-design2.pdf', 62],
  ['unit-de-relational-theory1.pdf', 71],
  ['unit-de-relational-theory2.pdf', 50],
  ['unit-de-retrieval-models.pdf', 18],
  ['unit-de-rm-algebraic.pdf', 45],
  ['unit-de-rm-term-based.pdf', 24],
  ['unit-de-rule-systems-inference.pdf', 39],
  ['unit-de-rule-systems-not.pdf', 20],
  ['unit-de-rule-systems.pdf', 58],
  ['unit-de-self-organizing-maps.pdf', 30],
  ['unit-de-semantic-web-introduction.pdf', 30],
  ['unit-de-semantic-web-ontology.pdf', 72],
  ['unit-de-semantic-web-rdf.pdf', 79],
  ['unit-de-semantic-web-rdfsem.pdf', 27],
  ['unit-de-semantic-web-rdfs.pdf', 32],
  ['unit-de-server-technologies1.pdf', 63],
  ['unit-de-server-technologies2.pdf', 84],
  ['unit-de-sql1.pdf', 96],
  ['unit-de-sql2.pdf', 38],
  ['unit-de-sql3.pdf', 16],
  ['unit-de-stemming.pdf', 12],
  ['unit-de-symbol.pdf', 32],
  ['unit-de-verification1.pdf', 46],
  ['unit-de-verification2.pdf', 132],
  ['unit-de-verification3.pdf', 32],
  ['unit-de-verification.pdf', 210],
  ['unit-de-webis-architectures1.pdf', 35],
  ['unit-de-webis-architectures2.pdf', 17],
  ['unit-de-wt-introduction.pdf', 57],
  ['unit-de-wt-organization.pdf', 7],
  ['unit-de-xps.pdf', 26],
  ['unit-en-association-analysis.pdf', 2],
  ['unit-en-astar-formal1.pdf', 63],
  ['unit-en-astar-formal2.pdf', 65],
  ['unit-en-astar-relaxed1.pdf', 42],
  ['unit-en-astar-relaxed2.pdf', 32],
  ['unit-en-basic-search1.pdf', 68],
  ['unit-en-basic-search2.pdf', 38],
  ['unit-en-bayesian-learning.pdf', 23],
  ['unit-en-cluster-analysis-basics.pdf', 21],
  ['unit-en-cluster-analysis-constrained.pdf', 38],
  ['unit-en-cluster-analysis-density.pdf', 59],
  ['unit-en-cluster-analysis-evaluation.pdf', 72],
  ['unit-en-cluster-analysis-hierarchical.pdf', 85],
  ['unit-en-cluster-analysis-iterative.pdf', 26],
  ['unit-en-concept-learning.pdf', 53],
  ['unit-en-data.pdf', 27],
  ['unit-en-decision-trees-algorithms.pdf', 26],
  ['unit-en-decision-trees-basics.pdf', 32],
  ['unit-en-decision-trees-impurity.pdf', 33],
  ['unit-en-decision-trees-pruning.pdf', 20],
  ['unit-en-diagnosis-gde.pdf', 56],
  ['unit-en-diagnosis-tms.pdf', 38],
  ['unit-en-dm-overview.pdf', 10],
  ['unit-en-game-playing-basics.pdf', 41],
  ['unit-en-informed-bf1.pdf', 102],
  ['unit-en-informed-bf2.pdf', 117],
  ['unit-en-informed-bf3.pdf', 21],
  ['unit-en-ml-introduction.pdf', 33],
  ['unit-en-ml-organization.pdf', 8],
  ['unit-en-multilayer-perceptron.pdf', 22],
  ['unit-en-perceptron-learning.pdf', 59],
  ['unit-en-performance-measures.pdf', 21],
  ['unit-en-probability-basics.pdf', 20],
  // ["unit-en-radial-basis-functions.pdf", 1],
  ['unit-en-regression.pdf', 44],
  ['unit-en-relaxed-models.pdf', 24],
  ['unit-en-representation1.pdf', 34],
  ['unit-en-representation2.pdf', 52],
  ['unit-en-rule-mining.pdf', 2],
  ['unit-en-search-introduction.pdf', 36],
  ['unit-en-search-organization.pdf', 4]
];

export { documentsData };