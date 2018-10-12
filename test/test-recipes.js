'use strict';

const chai = require('chai');
const chaiHttp = require('chai-http');

const { app, runServer, closeServer } = require('../server');

const expect = chai.expect;

chai.use(chaiHttp);

describe('Recipes', function(){
  before(function(){
    return runServer();
  });
  after(function() {
    return closeServer();
  });

  it('should list recipes on GET', function(){
    return chai.request(app)
      .get('/recipes')
      .then(function(res){
        expect(res).to.have.status(200);
        expect(res).to.be.json;
        expect(res.body).to.be.a('array');

        expect(res.body.length).to.be.at.least(1);

        const expectedKeys = ['id', 'name', 'ingredients'];
        res.body.forEach(function(item) {
          expect(item).to.be.a('object');
          expect(item).to.include.keys(expectedKeys);
        });
      });
  });

  it('should add a recipe on POST', function() {
    const newRecipe = { name: 'coffee', ingredients:['coffee beans', 'water'] };
    return chai
      .request(app)
      .post('/recipes')
      .send(newRecipe)
      .then(function(res) {
        expect(res).to.have.status(201);
        expect(res).to.be.json;
        expect(res.body).to.be.a('object');
        expect(res.body).to.include.keys('id', 'name', 'ingredients');
        expect(res.body.id).to.not.equal(null);
        expect(res.body.name).equal(newRecipe.name);
        expect(res.body.ingredients).to.be.a('array');
        expect(res.body.ingredients).to.include.members(newRecipe.ingredients);
      });
  });

  it('should update recipes on PUT', function() {
    // we initialize our updateData here and then after the initial
    // request to the app, we update it with an `id` property so
    // we can make a second, PUT call to the app.
    const updateData = {
      name: 'foo',
      ingredients: ['bar','bizz']
    };

    return (
      chai
        .request(app)
        // first have to get so we have an idea of object to update
        .get('/recipes')
        .then(function(res) {
          updateData.id = res.body[0].id;
          // this will return a promise whose value will be the response
          // object, which we can inspect in the next `then` block. Note
          // that we could have used a nested callback here instead of
          // returning a promise and chaining with `then`, but we find
          // this approach cleaner and easier to read and reason about.
          return chai
            .request(app)
            .put(`/recipes/${updateData.id}`)
            .send(updateData);
        })
        // prove that the PUT request has right status code
        // and returns updated item
        .then(function(res) {
          expect(res).to.have.status(204);
          //expect(res).to.be.json;
          // expect(res.body).to.be.a('object');
          // expect(res.body.name).equal(updateData.name);
          // expect(res.body.ingredients).to.include.members(updateData.ingredients);
        })
    );
  });
  it('should delete items on DELETE', function() {
    return (
      chai
        .request(app)
      // first have to get so we have an `id` of item
      // to delete
        .get('/recipes')
        .then(function(res) {
          return chai.request(app).delete(`/recipes/${res.body[0].id}`);
        })
        .then(function(res) {
          expect(res).to.have.status(204);
        })
    );
  });
});